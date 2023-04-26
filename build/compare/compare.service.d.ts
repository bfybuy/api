import 'core-js/proposals/array-grouping-stage-3-2';
declare const CompareService: {
    bot(payload: any): Promise<any>;
    performDBLookup(msg: string): Promise<any[]>;
    sortAlgorithm(data: {
        matches: any[];
        search: string | number;
    }[]): Promise<any[]>;
    pricePerUnit(product: any): {
        unit: string;
        price: any;
        cost_per_unit: number;
        cost_per_unit_string: string;
    };
};
export default CompareService;
