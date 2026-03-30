import { render, screen } from "@testing-library/react";

// Mock Next.js router so useRouter() doesn’t crash
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

import ServicesPage from "../../app/services/page";

test("renders Hair service group", () => {
  render(<ServicesPage />);
  expect(screen.getByText(/Hair/i)).toBeInTheDocument();
});
