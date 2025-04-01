import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Todos from "../components/Todos";
import useTodos from "../hooks/useTodos";
import { fetchPostWithAuth } from "../security/fetchWithAuth";

jest.mock("../hooks/useTodos");
jest.mock("../security/fetchWithAuth");

describe("Todos Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form and initial items", () => {
    useTodos.mockReturnValue([[], jest.fn()]);
    render(<Todos />);

    expect(screen.getByLabelText("New Todo Item")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\+ add item/i })
    ).toBeInTheDocument();
  });

  test("updates input value on change", () => {
    useTodos.mockReturnValue([[], jest.fn()]);

    render(<Todos />);
    const input = screen.getByLabelText("New Todo Item");

    fireEvent.change(input, { target: { value: "New Todo" } });
    expect(input.value).toBe("New Todo");
  });

  test("adds a new todo item on form submit and updates todosItems state", async () => {
    const setTodosItemsMock = jest.fn();
    useTodos.mockReturnValue([[], setTodosItemsMock]);

    fetchPostWithAuth.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, title: "New Todo", completed: false }),
    });

    render(<Todos />);

    const input = screen.getByLabelText("New Todo Item");
    const button = screen.getByRole("button", { name: /\+ add item/i });

    fireEvent.change(input, { target: { value: "New Todo" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchPostWithAuth).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/todos`,
        { title: "New Todo" }
      );
    });

    await waitFor(() => {
      expect(setTodosItemsMock).toHaveBeenCalledWith([
        { id: 1, title: "New Todo", completed: false },
      ]);
    });
    expect(input.value).toBe("");
  });

  test("does not add a new item if input is empty", async () => {
    useTodos.mockReturnValue([[], jest.fn()]);

    render(<Todos />);

    const button = screen.getByRole("button", { name: /\+ add item/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(fetchPostWithAuth).not.toHaveBeenCalled();
    });
  });

  test("displays todo items correctly", () => {
    const mockTodos = [
      { id: 1, title: "Test Todo 1", completed: false },
      { id: 2, title: "Test Todo 2", completed: true },
    ];
    useTodos.mockReturnValue([mockTodos, jest.fn()]);

    render(<Todos />);

    mockTodos.forEach((todo) => {
      expect(screen.getByText(todo.title)).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { checked: todo.completed })
      ).toBeInTheDocument();
    });
  });
});
