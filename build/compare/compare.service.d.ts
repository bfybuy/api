import 'core-js/proposals/array-grouping-stage-3-2';
declare const CompareService: {
    bot(payload: any): Promise<any>;
    performDBLookup(msg: string): Promise<any[]>;
    sortAlgorithm(data: {
        matches: any[];
        search: string | number;
    }[]): Promise<any[]>;
    extractPriceWithoutSymbol(price: any): any;
    pricePerUnit(product: any): {
        unit: any;
        price: any;
        cost_per_unit: any;
        cost_per_unit_string: string;
    };
};
export default CompareService;
