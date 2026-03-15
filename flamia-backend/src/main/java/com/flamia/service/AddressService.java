package com.flamia.service;

import com.flamia.dto.request.CreateAddressRequest;
import com.flamia.dto.response.AddressResponse;
import com.flamia.entity.Address;
import com.flamia.entity.User;
import com.flamia.exception.BusinessRuleException;
import com.flamia.exception.ForbiddenException;
import com.flamia.exception.ResourceNotFoundException;
import com.flamia.repository.AddressRepository;
import com.flamia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDRESSES = 5;

    public List<AddressResponse> getUserAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(UUID userId, CreateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        long count = addressRepository.countByUserId(userId);
        if (count >= MAX_ADDRESSES) {
            throw new BusinessRuleException("Maximum " + MAX_ADDRESSES + " addresses allowed");
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultForUser(userId);
        }

        Address address = Address.builder()
                .user(user)
                .label(request.getLabel())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        // If first address, make it default
        if (count == 0) {
            address.setIsDefault(true);
        }

        address = addressRepository.save(address);
        log.info("Address created: id={}, userId={}", address.getId(), userId);
        return toResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, CreateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ForbiddenException("Address not found or does not belong to you"));

        address.setLabel(request.getLabel());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.clearDefaultForUser(userId);
            address.setIsDefault(true);
        }

        address = addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ForbiddenException("Address not found or does not belong to you"));
        addressRepository.delete(address);
        log.info("Address deleted: id={}, userId={}", addressId, userId);
    }

    @Transactional
    public void setDefault(UUID userId, UUID addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ForbiddenException("Address not found or does not belong to you"));
        addressRepository.clearDefaultForUser(userId);
        address.setIsDefault(true);
        addressRepository.save(address);
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .isDefault(address.getIsDefault())
                .build();
    }
}
