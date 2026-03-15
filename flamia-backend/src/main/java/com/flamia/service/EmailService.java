package com.flamia.service;

import com.flamia.entity.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.from:orders@flamia.in}")
    private String fromAddress;

    /**
     * Sends order confirmation email to customer.
     * Runs asynchronously to not block the order creation flow.
     */
    @Async
    public void sendOrderConfirmation(Order order, String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank()) {
            log.info("Skipping order confirmation email: no email for order {}", order.getOrderNumber());
            return;
        }

        String subject = "Flamia Order Confirmed — " + order.getOrderNumber();
        String body = buildOrderConfirmationHtml(order);

        sendHtmlEmail(customerEmail, subject, body);
        log.info("Order confirmation email sent: orderNumber={}, email={}",
                order.getOrderNumber(), customerEmail);
    }

    /**
     * Sends order shipped notification to customer.
     */
    @Async
    public void sendShippingNotification(Order order, String customerEmail, String trackingId) {
        if (customerEmail == null || customerEmail.isBlank()) return;

        String subject = "Your Flamia Order Has Shipped — " + order.getOrderNumber();
        String body = buildShippingNotificationHtml(order, trackingId);

        sendHtmlEmail(customerEmail, subject, body);
        log.info("Shipping notification sent: orderNumber={}", order.getOrderNumber());
    }

    /**
     * Notifies admin of new UPI payment pending verification.
     */
    @Async
    public void notifyAdminUpiPayment(String adminEmail, String orderNumber, String utrNumber) {
        String subject = "🔔 UPI Payment Pending Verification — " + orderNumber;
        String body = String.format("""
            <div style="font-family: 'Inter', sans-serif; color: #333;">
                <h2 style="color: #FF8F0A;">UPI Payment Received</h2>
                <p><strong>Order:</strong> %s</p>
                <p><strong>UTR Number:</strong> %s</p>
                <p>Please verify this payment in the admin dashboard.</p>
            </div>
            """, orderNumber, utrNumber);

        sendHtmlEmail(adminEmail, subject, body);
    }

    // ── Private Helpers ───────────────────────────────

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildOrderConfirmationHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        order.getItems().forEach(item -> {
            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">%d</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹%s</td>
                </tr>
                """, item.getProductName(), item.getQuantity(), item.getTotalPrice()));
        });

        return String.format("""
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #1E1E28, #0A0A0F);">
                    <h1 style="color: #FF8F0A; font-size: 28px; margin: 0;">Flamia</h1>
                    <p style="color: #888; margin-top: 5px;">Luxury Scented Candles</p>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333;">Thank you for your order!</h2>
                    <p>Your order <strong>%s</strong> has been placed successfully.</p>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #f8f8f8;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                        %s
                    </table>
                    <div style="text-align: right; margin-top: 15px;">
                        <p>Subtotal: ₹%s</p>
                        <p>Discount: -₹%s</p>
                        <p style="font-size: 18px; font-weight: bold; color: #FF8F0A;">Total: ₹%s</p>
                    </div>
                </div>
                <div style="text-align: center; padding: 20px; background: #f8f8f8; color: #888; font-size: 12px;">
                    <p>© Flamia — Illuminate Your World</p>
                </div>
            </div>
            """,
            order.getOrderNumber(),
            itemsHtml.toString(),
            order.getSubtotal(),
            order.getDiscount(),
            order.getTotal());
    }

    private String buildShippingNotificationHtml(Order order, String trackingId) {
        return String.format("""
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #1E1E28, #0A0A0F);">
                    <h1 style="color: #FF8F0A; font-size: 28px; margin: 0;">Flamia</h1>
                </div>
                <div style="padding: 30px;">
                    <h2>Your order has shipped! 🚀</h2>
                    <p>Order <strong>%s</strong> is on its way to you.</p>
                    <div style="background: #FFF8F0; border: 1px solid #FFDBA8; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Tracking ID:</strong> %s</p>
                    </div>
                </div>
            </div>
            """,
            order.getOrderNumber(),
            trackingId != null ? trackingId : "Will be updated soon");
    }
}
