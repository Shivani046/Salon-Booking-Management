import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "../../app/signup/page";


// Mock Next.js router
jest.mock("next/navigation", () => {
  const push = jest.fn();
  return { useRouter: () => ({ push }) };
});

describe("SignupPage form", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = require("next/navigation").useRouter().push;
    jest.clearAllMocks();

    // Mock fetch for signup API
    global.fetch = jest.fn((url: string, options: any) => {
      if (url.includes("/api/customers/signup")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              custId: 123,
              message: "Signup successful",
            }),
        });
      }
      return Promise.reject(new Error("Unknown API"));
    }) as jest.Mock;
  });

  test("submits signup form and navigates on success", async () => {
    render(<SignupPage />);

    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
      target: { value: "Shivani" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Phone/i), {
      target: { value: "1234567890" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: `shivani_${Date.now()}@example.com` }, // unique email
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "secret123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    // Expect navigation after success
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
    });
  });
});