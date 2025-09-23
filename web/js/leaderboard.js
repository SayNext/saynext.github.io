
//Formatter to generate charts
var chartFormatter = function (cell, formatterParams, onRendered) {
    var content = document.createElement("span");
    var values = cell.getValue();

    //invert values if needed
    if (formatterParams.invert) {
        values = values.map(val => val * -1);
    }

    //add values to chart and style
    content.classList.add(formatterParams.type);
    content.inneHrTML = values.join(",");

    //setup chart options
    var options = {
        width: 50,
        // min: 0.0,
        // max: 100.0,
    }

    if (formatterParams.fill) {
        options.fill = formatterParams.fill
    }

    //instantiate piety chart after the cell element has been aded to the DOM
    onRendered(function () {
        peity(content, formatterParams.type, options);
    });

    return content;
};

var colorFormatter = function (cell, formatterParams) {
    var value = cell.getValue();

    // Check for the specific string "-"
    if (value === "-") {
        return value;
    }

    // Default values
    var defaults = {
        min: 0.0,
        max: 100.0,
        startColor: { r: 255, g: 255, b: 255 },
        endColor: { r: 238, g: 211, b: 217 },
        decimals: 1
    };

    // Override defaults with provided formatterParams values
    var min = (formatterParams && formatterParams.min) || defaults.min;
    var max = (formatterParams && formatterParams.max) || defaults.max;
    var startColor = (formatterParams && formatterParams.startColor) || defaults.startColor;
    var endColor = (formatterParams && formatterParams.endColor) || defaults.endColor;
    var decimals = (formatterParams && formatterParams.decimals) || defaults.decimals;

    // Normalize the value between 0 and 1
    var normalizedValue = (value - min) / (max - min);

    // Compute the color gradient 
    var red = Math.floor(startColor.r + (endColor.r - startColor.r) * normalizedValue);
    var green = Math.floor(startColor.g + (endColor.g - startColor.g) * normalizedValue);
    var blue = Math.floor(startColor.b + (endColor.b - startColor.b) * normalizedValue);

    // make sure the value is rounded to 1 decimal place
    value = parseFloat(value).toFixed(decimals)

    return "<span style='display: block; width: 100%; height: 100%; background-color: rgb(" + red + ", " + green + ", " + blue + ");'>" + value + "</span>";
}

var barColorFn = function (value, formatterParams) {
    var defaults = {
        range: [-50, 50],
        low: { r: 255, g: 255, b: 255 },
        high: { r: 206, g: 212, b: 218 }
    };

    // Override defaults with provided formatterParams values

    var low_range = (formatterParams && formatterParams.range[0]) || defaults.range[0];
    var high_range = (formatterParams && formatterParams.range[1]) || defaults.range[1];
    var low = (formatterParams && formatterParams.low) || defaults.low;
    var high = (formatterParams && formatterParams.high) || defaults.high;

    // Clamp the value to the range [-100, 100]
    value = Math.max(low_range, Math.min(high_range, value));
    var range = high_range - low_range;

    // Normalize the value to the range [0, 1]
    var normalizedValue = (value + range / 2) / range;
    // Interpolate between the two colors based on the normalized value
    var interpolated = {
        r: Math.floor(low.r + (high.r - low.r) * normalizedValue),
        g: Math.floor(low.g + (high.g - low.g) * normalizedValue),
        b: Math.floor(low.b + (high.b - low.b) * normalizedValue)
    };

    return 'rgba(' + interpolated.r + ',' + interpolated.g + ',' + interpolated.b + ',0.9)';
}

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        fetch('web/data/SayNext-PC2K.json').then(response => response.json()),
        fetch('web/data/SayNext-PC19K.json').then(response => response.json()),
        fetch('web/data/Cross-Scenarios.json').then(response => response.json()),
        fetch('web/data/Subject-Independent.json').then(response => response.json()),
    ]).then(([
        saynext_pc2k_data, saynext_pc19k_data, cross_scenarios_data, subject_independent_data
    ]) => {
        var getColumnMinMax = (data, field) => {
            let values = data.map(item => item[field]).filter(val => val !== "-").map(Number);
            return { min: Math.min(...values), max: Math.max(...values) };
        };

        var saynext_pc2k_columns = [
            {
                title: "Method",
                field: "method",
                widthGrow: 1.5,
                minWidth: 300,
                headerHozAlign: "left",
            },
            {
                title: "Lexical Overlap",
                columns: [
                    {
                        title: "BLEU-4", field: "BLEU-4", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                    {
                        title: "ROUGE-L", field: "ROUGE-L", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Semantic Similarity",
                columns: [
                    {
                        title: "BertScore-F1", field: "BertScore-F1", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                    {
                        title: "Sentence-BERT", field: "Sentence-BERT", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Emotion Consistency",
                columns: [
                    {
                        title: "Valence", field: "Valence", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                    {
                        title: "Arousal", field: "Arousal", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                ],
                headerHozAlign: "center",
            },
        ];

        var saynext_pc19k_columns = [
            {
                title: "Method",
                field: "method",
                widthGrow: 1.5,
                minWidth: 300,
                headerHozAlign: "left",
            },
            {
                title: "Lexical Overlap",
                columns: [
                    {
                        title: "BLEU-4", field: "BLEU-4", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                    {
                        title: "ROUGE-L", field: "ROUGE-L", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Semantic Similarity",
                columns: [
                    {
                        title: "BertScore-F1", field: "BertScore-F1", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                    {
                        title: "Sentence-BERT", field: "Sentence-BERT", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Emotion Consistency",
                columns: [
                    {
                        title: "Valence", field: "Valence", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                    {
                        title: "Arousal", field: "Arousal", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                ],
                headerHozAlign: "center",
            },
        ];

        var cross_scenarios_columns = [
            {
                title: "Method",
                field: "method",
                widthGrow: 1.5,
                minWidth: 300,
                headerHozAlign: "left",
            },
            {
                title: "Lexical Overlap",
                columns: [
                    {
                        title: "BLEU-4", field: "BLEU-4", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                    {
                        title: "ROUGE-L", field: "ROUGE-L", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Semantic Similarity",
                columns: [
                    {
                        title: "BertScore-F1", field: "BertScore-F1", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                    {
                        title: "Sentence-BERT", field: "Sentence-BERT", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Emotion Consistency",
                columns: [
                    {
                        title: "Valence", field: "Valence", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                    {
                        title: "Arousal", field: "Arousal", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                ],
                headerHozAlign: "center",
            },
        ];

        var subject_independent_columns = [
            {
                title: "Method",
                field: "method",
                widthGrow: 1.5,
                minWidth: 300,
                headerHozAlign: "left",
            },
            {
                title: "Lexical Overlap",
                columns: [
                    {
                        title: "BLEU-4", field: "BLEU-4", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                    {
                        title: "ROUGE-L", field: "ROUGE-L", hozAlign: "center", formatter: colorFormatter, minWidth: 90, responsive: 2, headerHozAlign: "center",
                        formatterParams: { decimals: 3, endColor: { r: 225, g: 213, b: 232 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Semantic Similarity",
                columns: [
                    {
                        title: "BertScore-F1", field: "BertScore-F1", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                    {
                        title: "Sentence-BERT", field: "Sentence-BERT", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 4, endColor: { r: 222, g: 233, b: 252 } }
                    },
                ],
                headerHozAlign: "center",
            },
            {
                title: "Emotion Consistency",
                columns: [
                    {
                        title: "Valence", field: "Valence", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                    {
                        title: "Arousal", field: "Arousal", hozAlign: "center", formatter: colorFormatter, minWidth: 90, headerHozAlign: "center",
                        formatterParams: { decimals: 5, endColor: { r: 252, g: 242, b: 204 } }
                    },
                ],
                headerHozAlign: "center",
            },
        ];


        // saynext_pc2k_columns.forEach(column => {
        //     if (column.columns) {
        //         column.columns.forEach(subColumn => {
        //             let { min, max } = getColumnMinMax(saynext_pc2k_data, subColumn.field);
        //             subColumn.formatterParams = { min, max };
        //         });
        //     } else if (column.field !== "overall_performance") {
        //         let { min, max } = getColumnMinMax(saynext_pc2k_data, column.field);
        //         column.formatterParams = { min, max };
        //     }
        // });
        saynext_pc2k_columns.forEach(function (column) {
            if (column.columns) {
                column.columns.forEach(function (sub) {
                    var mm = getColumnMinMax(saynext_pc2k_data, sub.field);
                    var prev = sub.formatterParams || {};
                    sub.formatterParams = Object.assign({}, prev, {
                        min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                        max: prev.hasOwnProperty('max') ? prev.max : mm.max
                    });
                });
            } else if (column.field !== "overall_performance") {
                var mm = getColumnMinMax(saynext_pc2k_data, column.field);
                var prev = column.formatterParams || {};
                column.formatterParams = Object.assign({}, prev, {
                    min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                    max: prev.hasOwnProperty('max') ? prev.max : mm.max
                });
            }
        });


        saynext_pc19k_columns.forEach(function (column) {
            if (column.columns) {
                column.columns.forEach(function (sub) {
                    var mm = getColumnMinMax(saynext_pc19k_data, sub.field);
                    var prev = sub.formatterParams || {};
                    sub.formatterParams = Object.assign({}, prev, {
                        min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                        max: prev.hasOwnProperty('max') ? prev.max : mm.max
                    });
                });
            } else if (column.field !== "overall_performance") {
                var mm = getColumnMinMax(saynext_pc19k_data, column.field);
                var prev = column.formatterParams || {};
                column.formatterParams = Object.assign({}, prev, {
                    min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                    max: prev.hasOwnProperty('max') ? prev.max : mm.max
                });
            }
        });


        cross_scenarios_columns.forEach(function (column) {
            if (column.columns) {
                column.columns.forEach(function (sub) {
                    var mm = getColumnMinMax(cross_scenarios_data, sub.field);
                    var prev = sub.formatterParams || {};
                    sub.formatterParams = Object.assign({}, prev, {
                        min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                        max: prev.hasOwnProperty('max') ? prev.max : mm.max
                    });
                });
            } else if (column.field !== "overall_performance") {
                var mm = getColumnMinMax(cross_scenarios_data, column.field);
                var prev = column.formatterParams || {};
                column.formatterParams = Object.assign({}, prev, {
                    min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                    max: prev.hasOwnProperty('max') ? prev.max : mm.max
                });
            }
        });


        subject_independent_columns.forEach(function (column) {
            if (column.columns) {
                column.columns.forEach(function (sub) {
                    var mm = getColumnMinMax(subject_independent_data, sub.field);
                    var prev = sub.formatterParams || {};
                    sub.formatterParams = Object.assign({}, prev, {
                        min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                        max: prev.hasOwnProperty('max') ? prev.max : mm.max
                    });
                });
            } else if (column.field !== "overall_performance") {
                var mm = getColumnMinMax(subject_independent_data, column.field);
                var prev = column.formatterParams || {};
                column.formatterParams = Object.assign({}, prev, {
                    min: prev.hasOwnProperty('min') ? prev.min : mm.min,
                    max: prev.hasOwnProperty('max') ? prev.max : mm.max
                });
            }
        });

        var saynext_pc2k_table = new Tabulator("#saynext-pc2k-main-table", {
            data: saynext_pc2k_data,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            responsiveLayoutCollapseStartOpen: false,
            movableColumns: false,
            columnDefaults: {
                tooltip: true,
            },
            columns: saynext_pc2k_columns
        });

        var saynext_pc19k_table = new Tabulator("#saynext-pc19k-main-table", {
            data: saynext_pc19k_data,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            responsiveLayoutCollapseStartOpen: false,
            movableColumns: false,
            columnDefaults: {
                tooltip: true,
            },
            columns: saynext_pc19k_columns
        });

        var subject_independent_table = new Tabulator("#subject-independent-main-table", {
            data: subject_independent_data,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            responsiveLayoutCollapseStartOpen: false,
            movableColumns: false,
            columnDefaults: {
                tooltip: true,
            },
            columns: subject_independent_columns
        });

        var cross_scenarios_table = new Tabulator("#cross-scenarios-main-table", {
            data: cross_scenarios_data,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            responsiveLayoutCollapseStartOpen: false,
            movableColumns: false,
            columnDefaults: {
                tooltip: true,
            },
            columns: cross_scenarios_columns
        });
    });
})
