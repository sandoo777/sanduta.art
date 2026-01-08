/**
 * Integration tests for the Product Configurator UI
 * Tests all sections and workflows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Configurator } from '../Configurator';
import * as useConfiguratorModule from '@/modules/configurator/useConfigurator';

// Mock useConfigurator hook
const mockUseConfigurator = vi.fn();
vi.spyOn(useConfiguratorModule, 'useConfigurator').mockImplementation(mockUseConfigurator);

const mockProduct = {
  id: 'test-product-1',
  slug: 'test-product',
  name: 'Test Product',
  descriptionShort: 'A test product',
  type: 'CONFIGURABLE' as const,
  active: true,
  options: [
    {
      id: 'color',
      name: 'Color',
      type: 'dropdown' as const,
      required: true,
      values: [
        { id: 'red', label: 'Red', value: 'red' },
        { id: 'blue', label: 'Blue', value: 'blue' },
      ],
    },
  ],
  materials: [],
  printMethods: [],
  finishing: [],
  pricing: {
    type: 'per_unit' as const,
    basePrice: 100,
    priceBreaks: [],
  },
  dimensions: {
    minWidth: 100,
    maxWidth: 1000,
    minHeight: 100,
    maxHeight: 1000,
    unit: 'mm' as const,
  },
  images: ['/test-image.jpg'],
  defaultImage: '/test-image.jpg',
  defaults: {
    finishingIds: [],
    optionValues: {},
    quantity: 1,
  },
};

const mockMaterial = {
  id: 'material-1',
  name: 'Test Material',
  unit: 'buc',
  costPerUnit: 10,
  effectiveCost: 10,
};

const mockPrintMethod = {
  id: 'print-1',
  name: 'Digital Print',
  type: 'digital',
  costPerM2: 50,
  materialIds: ['material-1'],
};

const mockFinishing = {
  id: 'finishing-1',
  name: 'Lamination',
  costFix: 5,
  compatibleMaterialIds: ['material-1'],
  compatiblePrintMethodIds: ['print-1'],
};

const mockPriceSummary = {
  base: 100,
  materialCost: 10,
  printCost: 50,
  finishingCost: 5,
  optionCost: 0,
  discounts: 0,
  total: 165,
  quantity: 1,
  pricingType: 'per_unit' as const,
  breakdown: {
    optionValueCost: 0,
    ruleAdjustment: 0,
    materialMultiplier: 1,
  },
};

describe('Configurator Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC1: should render loading state initially', () => {
    mockUseConfigurator.mockReturnValue({
      loading: true,
      product: undefined,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [],
      printMethods: [],
      finishing: [],
      priceSummary: undefined,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);
    expect(screen.getByText(/Se încarcă configuratorul/i)).toBeInTheDocument();
  });

  it('TC2: should render error state when product fails to load', () => {
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: undefined,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [],
      printMethods: [],
      finishing: [],
      priceSummary: undefined,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);
    expect(screen.getByText(/Produs indisponibil/i)).toBeInTheDocument();
  });

  it('TC3: should render all sections for configurable product', () => {
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: {
        quantity: 1,
        finishingIds: [],
        options: {},
        dimension: { width: 500, height: 500, unit: 'mm' },
      },
      visibleOptions: mockProduct.options,
      materials: [mockMaterial],
      printMethods: [mockPrintMethod],
      finishing: [mockFinishing],
      priceSummary: mockPriceSummary,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    // Check if all sections are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/Dimensiuni/i)).toBeInTheDocument();
    expect(screen.getByText(/Material/i)).toBeInTheDocument();
    expect(screen.getByText(/Metodă imprimare/i)).toBeInTheDocument();
    expect(screen.getByText(/Finisaje/i)).toBeInTheDocument();
    expect(screen.getByText(/Opțiuni personalizare/i)).toBeInTheDocument();
    expect(screen.getByText(/Cantitate/i)).toBeInTheDocument();
  });

  it('TC4: should handle material selection', () => {
    const setMaterial = vi.fn();
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [mockMaterial],
      printMethods: [],
      finishing: [],
      priceSummary: mockPriceSummary,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial,
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    const materialCard = screen.getByText('Test Material').closest('button');
    fireEvent.click(materialCard!);

    expect(setMaterial).toHaveBeenCalledWith('material-1');
  });

  it('TC5: should handle quantity changes', () => {
    const setQuantity = vi.fn();
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [],
      printMethods: [],
      finishing: [],
      priceSummary: mockPriceSummary,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity,
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    const incrementButton = screen.getByText('+');
    fireEvent.click(incrementButton);

    expect(setQuantity).toHaveBeenCalledWith(2);
  });

  it('TC6: should display validation errors', () => {
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [],
      printMethods: [],
      finishing: [],
      priceSummary: mockPriceSummary,
      errors: ['Selectează un material', 'Completează dimensiunile'],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    expect(screen.getByText(/Configurație incompletă/i)).toBeInTheDocument();
    expect(screen.getByText('Selectează un material')).toBeInTheDocument();
    expect(screen.getByText('Completează dimensiunile')).toBeInTheDocument();
  });

  it('TC7: should display price summary with breakdown', () => {
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [mockMaterial],
      printMethods: [mockPrintMethod],
      finishing: [mockFinishing],
      priceSummary: mockPriceSummary,
      errors: [],
      loadProduct: vi.fn(),
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    // Check price breakdown
    expect(screen.getByText(/Preț bază/i)).toBeInTheDocument();
    expect(screen.getByText('100.00 MDL')).toBeInTheDocument();
    expect(screen.getByText(/Material/i)).toBeInTheDocument();
    expect(screen.getByText('10.00 MDL')).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByText('165.00 MDL')).toBeInTheDocument();
  });

  it('TC8: should load product on mount', () => {
    const loadProduct = vi.fn();
    mockUseConfigurator.mockReturnValue({
      loading: false,
      product: mockProduct,
      selections: { quantity: 1, finishingIds: [], options: {} },
      visibleOptions: [],
      materials: [],
      printMethods: [],
      finishing: [],
      priceSummary: mockPriceSummary,
      errors: [],
      loadProduct,
      setOption: vi.fn(),
      setMaterial: vi.fn(),
      setPrintMethod: vi.fn(),
      setFinishing: vi.fn(),
      setQuantity: vi.fn(),
      setDimension: vi.fn(),
      validateSelections: vi.fn(),
    });

    render(<Configurator productId="test-product-1" />);

    expect(loadProduct).toHaveBeenCalledWith('test-product-1');
  });
});
