from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class LoginTests(APITestCase):
    def setUp(self):
        self.email = "test@example.com"
        self.password = "password123"
        self.user = User.objects.create_user(
            username=self.email,
            email=self.email,
            password=self.password,
            role='OWNER'
        )
        self.login_url = "/api/account/login/"

    def test_login_mixed_case_email(self):
        """
        Ensure login works even if the email is provided with different casing.
        """
        data = {
            "username": "Test@Example.com",  # Mixed case
            "password": self.password
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
