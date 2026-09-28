import { render, screen } from "@testing-library/react";
import MaterialsList from "../MaterialsList";
import seed from "../../../../data/materials.json";

test("renders materials table with seed data", () => {
  render(<MaterialsList materials={seed} />);
  expect(screen.getByRole("table", { name: /Materials table/i })).toBeInTheDocument();
  expect(screen.getByText(seed[0].sku)).toBeInTheDocument();
  expect(screen.getByLabelText(new RegExp(`Edit ${seed[0].sku}`))).toBeInTheDocument();
});

test("shows category column by default when no format filter is active", () => {
  render(<MaterialsList materials={seed} selectedFormatCategory={null} />);

  expect(screen.getByRole("columnheader", { name: /category/i })).toBeInTheDocument();
  expect(screen.getAllByText("lamination").length).toBeGreaterThan(0);
});

test("hides category column when formats filter is active", () => {
  render(<MaterialsList materials={seed} selectedFormatCategory="FOI" />);

  expect(screen.queryByRole("columnheader", { name: /category/i })).not.toBeInTheDocument();
  expect(screen.queryAllByText("lamination")).toHaveLength(0);
});

test("renders structured technical columns for weight, format and unit", () => {
  const materials = [
    {
      id: "MAT-100",
      sku: "MAT-100",
      name: "A4 Matt 170g",
      category: "paper",
      purchasePrice: 0.15,
      sellPrice: 0.22,
      unit: "pcs",
      wastePercent: 1.5,
      compatiblePrintMethods: [],
      active: true,
      formatName: "A4",
      width_mm: 210,
      height_mm: 297,
      thickness: 0.17,
    },
  ];

  render(<MaterialsList materials={materials as any} selectedFormatCategory={null} />);

  expect(screen.getByRole("columnheader", { name: /gramaj/i })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /format/i })).toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /unit/i })).toBeInTheDocument();
  expect(screen.getByText("170 g")).toBeInTheDocument();
  expect(screen.getByText("A4 (210 × 297 mm)")).toBeInTheDocument();
  expect(screen.getByText("pcs")).toBeInTheDocument();
});
