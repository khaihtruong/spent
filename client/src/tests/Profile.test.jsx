import { render, screen, waitFor } from "@testing-library/react";
import Profile from "../components/Profile";
import { useAuthUser } from "../security/AuthContext";
import { fetchGetWithAuth } from "../security/fetchWithAuth";

jest.mock("../security/AuthContext");
jest.mock("../security/fetchWithAuth");

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthUser.mockReturnValue({
      user: { name: "John Doe", email: "johndoe@example.com" },
    });
  });

  test("renders user's name and email when user is authenticated", () => {
    render(<Profile />);

    expect(screen.getByText(/name: john doe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/📧 email: johndoe@example.com/i)
    ).toBeInTheDocument();
  });

  test("displays correct income, expense, and balance from API", async () => {
    fetchGetWithAuth.mockResolvedValueOnce({
      incomes: [{ amount: 1000 }, { amount: 500 }],
      expenses: [{ amount: 300 }],
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/🟢 income: \$1500\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/🔴 expense: \$300\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/💰 current balance: \$1200\.00/i)).toBeInTheDocument();
    });
  });

  test("handles empty incomes and expenses gracefully", async () => {
    fetchGetWithAuth.mockResolvedValueOnce({
      incomes: [],
      expenses: [],
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/🟢 income: \$0\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/🔴 expense: \$0\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/💰 current balance: \$0\.00/i)).toBeInTheDocument();
    });
  });

  test("handles fetch failure and displays zeroed values", async () => {
    fetchGetWithAuth.mockRejectedValueOnce(new Error("Network Error"));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/🟢 income: \$0\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/🔴 expense: \$0\.00/i)).toBeInTheDocument();
      expect(screen.getByText(/💰 current balance: \$0\.00/i)).toBeInTheDocument();
    });
  });
});
