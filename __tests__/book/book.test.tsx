import { render, screen, fireEvent } from "@testing-library/react";
import BookPage from "../../app/book/page";

// Mock Next.js router
jest.mock("next/navigation", () => {
  const push = jest.fn();
  return { useRouter: () => ({ push }) };
});

describe("BookPage dropdowns and button", () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = require("next/navigation").useRouter().push;
    jest.clearAllMocks();

    // Mock fetch for services and staff
    global.fetch = jest.fn((url: string) => {
      if (url.includes("/api/services")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { serviceId: 1, type: "Haircut", category: "Hair", price: 500 },
              { serviceId: 2, type: "Hair Spa", category: "Hair", price: 1000 },
              { serviceId: 3, type: "Facial", category: "Skin", price: 800 },
            ]),
        });
      }
      if (url.includes("/api/staff")) {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(
              JSON.stringify([
                { staffId: 20, name: "Hazel John" },
                { staffId: 21, name: "Other Staff" },
              ])
            ),
        });
      }
      return Promise.reject(new Error("Unknown API"));
    }) as jest.Mock;
  });

  test("enables Continue when Hair → Hair Spa → Hazel John is selected", async () => {
    render(<BookPage />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), {
      target: { value: "Shivani" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Phone/i), {
      target: { value: "1234567890" },
    });

    // Select category: Hair
    fireEvent.change(screen.getByDisplayValue("Select Category"), {
      target: { value: "Hair" },
    });

    // Select service: Hair Spa
    fireEvent.change(await screen.findByDisplayValue("Select Service"), {
      target: { value: "2" }, // Hair Spa serviceId
    });

    // Staff dropdown: pick Hazel John
    const selects = await screen.findAllByRole("combobox");
    const staffSelect = selects[2]; // third select is staff
    fireEvent.change(staffSelect, { target: { value: "20" } });

    // Date input
    const dateInput = screen.getByRole("combobox", { name: "" });
    fireEvent.change(dateInput, { target: { value: "2026-03-27" } });

    // Time dropdown
    fireEvent.change(screen.getByDisplayValue("Time"), {
      target: { value: "10:00" },
    });

    // Continue button
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    expect(continueBtn).toBeEnabled();

    fireEvent.click(continueBtn);
    expect(pushMock).toHaveBeenCalled();
  });
});


