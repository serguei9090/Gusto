import { beforeEach, describe, expect, it, vi } from "vitest";
import { currencyRepository } from "../../services/currency.repository";
import { useCurrencyStore } from "../currency.store";

// Mock the repository
vi.mock("../../services/currency.repository", () => ({
  currencyRepository: {
    getAllCurrencies: vi.fn(),
    getAllExchangeRates: vi.fn(),
    getBaseCurrency: vi.fn(),
    setBaseCurrency: vi.fn(),
    addExchangeRate: vi.fn(),
    updateExchangeRate: vi.fn(),
    deleteExchangeRate: vi.fn(),
    addCurrency: vi.fn(),
    toggleCurrencyStatus: vi.fn(),
    checkCurrencyUsage: vi.fn(),
    deleteCurrency: vi.fn(),
  },
}));

describe("CurrencyStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCurrencyStore.setState({
      currencies: [],
      exchangeRates: [],
      baseCurrency: "USD",
      isLoading: false,
      error: null,
    });
  });

  it("should load currencies successfully", async () => {
    const mockCurrencies = [
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        decimalPlaces: 2,
        isActive: true,
      },
    ];
    vi.mocked(currencyRepository.getAllCurrencies).mockResolvedValue(
      mockCurrencies,
    );

    await useCurrencyStore.getState().loadCurrencies();

    expect(useCurrencyStore.getState().currencies).toEqual(mockCurrencies);
    expect(useCurrencyStore.getState().isLoading).toBe(false);
  });

  it("should handle error during loadCurrencies", async () => {
    vi.mocked(currencyRepository.getAllCurrencies).mockRejectedValue(
      new Error("Fetch failed"),
    );

    await useCurrencyStore.getState().loadCurrencies();

    expect(useCurrencyStore.getState().error).toBe("Fetch failed");
    expect(useCurrencyStore.getState().isLoading).toBe(false);
  });

  it("should load exchange rates successfully", async () => {
    const mockRates = [
      {
        id: 1,
        fromCurrency: "EUR",
        toCurrency: "USD",
        rate: 1.1,
        effectiveDate: "2024",
      },
    ];
    vi.mocked(currencyRepository.getAllExchangeRates).mockResolvedValue(
      mockRates,
    );

    await useCurrencyStore.getState().loadExchangeRates();

    expect(useCurrencyStore.getState().exchangeRates).toEqual(mockRates);
  });

  it("should set base currency successfully", async () => {
    await useCurrencyStore.getState().setBaseCurrency("GBP");

    expect(currencyRepository.setBaseCurrency).toHaveBeenCalledWith("GBP");
    expect(useCurrencyStore.getState().baseCurrency).toBe("GBP");
  });

  it("should add exchange rate and reload", async () => {
    const loadSpy = vi.spyOn(useCurrencyStore.getState(), "loadExchangeRates");

    await useCurrencyStore.getState().addExchangeRate({
      fromCurrency: "USD",
      toCurrency: "EUR",
      rate: 0.9,
    });

    expect(currencyRepository.addExchangeRate).toHaveBeenCalledWith(
      "USD",
      "EUR",
      0.9,
      undefined,
      undefined,
    );
    expect(loadSpy).toHaveBeenCalled();
  });

  it("should delete currency check usage first", async () => {
    vi.mocked(currencyRepository.checkCurrencyUsage).mockResolvedValue(true);

    await expect(
      useCurrencyStore.getState().deleteCurrency("CAD"),
    ).rejects.toThrow("Cannot delete CAD: Currency is in use");

    expect(currencyRepository.deleteCurrency).not.toHaveBeenCalled();
  });

  it("should delete currency if not in use", async () => {
    vi.mocked(currencyRepository.checkCurrencyUsage).mockResolvedValue(false);
    const loadSpy = vi.spyOn(useCurrencyStore.getState(), "loadCurrencies");

    await useCurrencyStore.getState().deleteCurrency("CAD");

    expect(currencyRepository.deleteCurrency).toHaveBeenCalledWith("CAD");
    expect(loadSpy).toHaveBeenCalled();
  });

  it("should initialize all data", async () => {
    const s = useCurrencyStore.getState();
    const loadCurrenciesSpy = vi.spyOn(s, "loadCurrencies");
    const loadRatesSpy = vi.spyOn(s, "loadExchangeRates");
    const loadBaseSpy = vi.spyOn(s, "loadBaseCurrency");

    await s.initialize();

    expect(loadCurrenciesSpy).toHaveBeenCalled();
    expect(loadRatesSpy).toHaveBeenCalled();
    expect(loadBaseSpy).toHaveBeenCalled();
  });
});
