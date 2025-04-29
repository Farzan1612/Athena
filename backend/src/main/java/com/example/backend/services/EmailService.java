package com.example.backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Generic method to send email
    public void sendEmail(String toEmail, String subject, String messageBody) {
        logger.info("Attempting to send email to: {}", toEmail);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("webcoderak@gmail.com"); // From address
            message.setTo(toEmail);                  // To address
            message.setSubject(subject);             // Subject
            message.setText(messageBody);             // Body

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Error while sending email: " + e.getMessage());
        }
    }

    // Specific method for sending order confirmation
    public void sendOrderConfirmation(String toEmail, String orderId, double amount) {
        logger.info("Preparing order confirmation email for order: {}", orderId);

        try {
            String subject = "Order Confirmation - Order ID: " + orderId;
            String message = String.format(
                "Dear Customer,\n\nYour order with ID %s has been successfully placed.\nTotal Amount: ₹%.2f\n\nThank you for shopping with us!\n\nBest Regards,\nAthena Store",
                orderId, amount
            );

            sendEmail(toEmail, subject, message);
            logger.info("Order confirmation email sent successfully for order: {}", orderId);

        } catch (Exception e) {
            logger.error("Failed to send order confirmation email for order: {}", orderId, e);
            throw new RuntimeException("Error while sending order confirmation: " + e.getMessage());
        }
    }
}
