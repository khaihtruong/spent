import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../components/Home";
import { useAuthUser } from "../security/AuthContext";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../security/AuthContext");

describe("Home Component", () => {
  const mockNavigate = jest.fn();

  const renderHome = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders login and create account buttons when user is not authenticated", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    renderHome();

    expect(screen.getByText("Spent")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("renders enter app and create account buttons when user is authenticated", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: true });

    renderHome();

    expect(screen.getByRole("button", { name: /enter app/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("navigates to login page when login button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("navigates to app page when enter app button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: true });

    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /enter app/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/app");
  });

  test("navigates to register page when create account button is clicked", () => {
    useAuthUser.mockReturnValue({ isAuthenticated: false });

    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });
});
