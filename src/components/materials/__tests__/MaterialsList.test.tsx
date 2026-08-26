import { render, screen } from "@testing-library/react";
import MaterialsList from "../MaterialsList";
import seed from "../../../../data/materials.json";

test("renders materials table with seed data", () => {
  render(<MaterialsList materials={seed} />);
  expect(screen.getByRole("table", { name: /Materials table/i })).toBeInTheDocument();
  expect(screen.getByText(seed[0].sku)).toBeInTheDocument();
  expect(screen.getByLabelText(new RegExp(`Edit ${seed[0].sku}`))).toBeInTheDocument();
});
