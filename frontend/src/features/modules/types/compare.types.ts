import type { Module } from '../../../shared/types/index';

export interface CompareModule extends Module {
    selected?: boolean;
}

export interface ModuleComparison {
    modules: Module[];
    similarities: string[];
    differences: ComparisonDifference[];
}

export interface ComparisonDifference {
    field: string;
    values: Record<string, string | number>;
}

export interface CompareField {
    key: keyof Module;
    label: string;
    isNumeric?: boolean;
}
