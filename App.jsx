import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Upload, Printer, Sparkles } from 'lucide-react';

// A custom SVG logo component for branding.
const AVELogo = () => (
    <svg viewBox="0 0 260 90" className="h-16 w-auto" xmlns="http://www.w3.org/2000/svg">
         <style>
            {`.heavy-font { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; font-size: 80px; }
              .sub-font { font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 1.8px; fill: #4A4A4A; }`}
        </style>
        
        {/* Main Letters */}
        <text x="0" y="70" className="heavy-font" fill="#007B80">A</text>
        <text x="95" y="70" className="heavy-font" fill="#F7A721">V</text>
        <text x="190" y="70" className="heavy-font" fill="#007B80">E</text>

        {/* Separator Lines */}
        <rect x="78" y="10" width="3" height="65" fill="#F7A721" />
        <rect x="170" y="10" width="3" height="65" fill="#007B80" />
        
        {/* Subtitle Text */}
        <text x="4" y="85" className="sub-font">ADDED VALUE ENTERPRISES</text>
    </svg>
);


// Main application component for the budget forecasting tool.
export default function BudgetForecastingTool() {
    // Initial data setup for different fiscal years.
    const [yearData, setYearData] = useState({
        '24/25': [
            { id: 1, name: 'Oct', salesActual: 95000, salesBudget: 100000, wagesActual: 28000, wagesBudget: 30000, overheadsActual: 19000, overheadsBudget: 20000 },
            { id: 2, name: 'Nov', salesActual: 102000, salesBudget: 100000, wagesActual: 31000, wagesBudget: 30000, overheadsActual: 21000, overheadsBudget: 20000 },
            { id: 3, name: 'Dec', salesActual: 98000, salesBudget: 100000, wagesActual: 29000, wagesBudget: 30000, overheadsActual: 20000, overheadsBudget: 20000 },
        ],
        '25/26': [
            { id: 1, name: 'Apr', salesActual: 105000, salesBudget: 110000, wagesActual: 32000, wagesBudget: 33000, overheadsActual: 21000, overheadsBudget: 22000 },
            { id: 2, name: 'May', salesActual: 115000, salesBudget: 110000, wagesActual: 33000, wagesBudget: 33000, overheadsActual: 22000, overheadsBudget: 22000 },
            { id: 3, name: 'Jun', salesActual: 112000, salesBudget: 110000, wagesActual: 32500, wagesBudget: 33000, overheadsActual: 21500, overheadsBudget: 22000 },
            { id: 4, name: 'Jul', salesActual: 0, salesBudget: 115000, wagesActual: 0, wagesBudget: 34000, overheadsActual: 0, overheadsBudget: 23000 },
            { id: 5, name: 'Aug', salesActual: 0, salesBudget: 115000, wagesActual: 0, wagesBudget: 34000, overheadsActual: 0, overheadsBudget: 23000 },
            { id: 6, name: 'Sep', salesActual: 0, salesBudget: 115000, wagesActual: 0, wagesBudget: 34000, overheadsActual: 0, overheadsBudget: 23000 },
            { id: 7, name: 'Oct', salesActual: 0, salesBudget: 120000, wagesActual: 0, wagesBudget: 35000, overheadsActual: 0, overheadsBudget: 24000 },
        ],
    });

    // State management for the application.
    const [selectedYear, setSelectedYear] = useState('25/26');
    const [months, setMonths] = useState(yearData[selectedYear]);
    const [showInputTable, setShowInputTable] = useState(true);
    const [nextIdByYear, setNextIdByYear] = useState({ '24/25': 4, '25/26': 8 });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // State for commentaries and loading indicators for AI generation.
    const [executiveSummary, setExecutiveSummary] = useState('Overall performance for the selected period shows promising trends in sales, exceeding budget expectations. However, careful monitoring of wages and overheads is required to maintain healthy profit margins.');
    const [salesCommentary, setSalesCommentary] = useState('');
    const [wagesCommentary, setWagesCommentary] = useState('');
    const [overheadsCommentary, setOverheadsCommentary] = useState('');
    const [profitCommentary, setProfitCommentary] = useState('');
    const [isGenerating, setIsGenerating] = useState({ sales: false, wages: false, overheads: false, profit: false });

    // State for managing chart types for different data categories.
    const [chartTypes, setChartTypes] = useState({
        sales: 'bar',
        wages: 'bar',
        overheads: 'bar',
        profit: 'bar'
    });

    /**
     * Handles changing the fiscal year, updating the displayed month data.
     * @param {string} year - The selected fiscal year.
     */
    const handleYearChange = (year) => {
        setSelectedYear(year);
        setMonths(yearData[year] || []);
    };
    
    /**
     * Handles file upload for CSV data, parsing it and updating the state.
     * @param {Event} e - The file input change event.
     */
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(1); // Skip header row
                const newMonths = lines.map((line, index) => {
                    const values = line.split(',');
                    if (values.length < 7) return null;
                    return {
                        id: index + 1,
                        name: values[0].trim(),
                        salesBudget: parseFloat(values[1]) || 0,
                        salesActual: parseFloat(values[2]) || 0,
                        wagesBudget: parseFloat(values[3]) || 0,
                        wagesActual: parseFloat(values[4]) || 0,
                        overheadsBudget: parseFloat(values[5]) || 0,
                        overheadsActual: parseFloat(values[6]) || 0,
                    };
                }).filter(Boolean); // Filter out any null entries from invalid rows

                if (newMonths.length > 0) {
                    setMonths(newMonths);
                    const newYearData = { ...yearData, [selectedYear]: newMonths };
                    setYearData(newYearData);
                    const newNextId = { ...nextIdByYear, [selectedYear]: newMonths.length + 1 };
                    setNextIdByYear(newNextId);
                }
            };
            reader.readAsText(file);
        }
    };

    /**
     * Adds a new month to the data table with default zero values.
     */
    const addMonth = () => {
        if (months.length >= 12) return;
        const newMonth = {
            id: nextIdByYear[selectedYear],
            name: monthNames[months.length % 12],
            salesActual: 0, salesBudget: 0,
            wagesActual: 0, wagesBudget: 0,
            overheadsActual: 0, overheadsBudget: 0,
        };
        const updatedMonths = [...months, newMonth];
        setMonths(updatedMonths);
        setYearData({ ...yearData, [selectedYear]: updatedMonths });
        setNextIdByYear({ ...nextIdByYear, [selectedYear]: nextIdByYear[selectedYear] + 1 });
    };

    /**
     * Removes the last month from the data table.
     */
    const removeLastMonth = () => {
        if (months.length > 1) {
            const updatedMonths = months.slice(0, -1);
            setMonths(updatedMonths);
            setYearData({ ...yearData, [selectedYear]: updatedMonths });
        }
    };

    /**
     * Updates a specific field for a given month.
     * @param {number} id - The ID of the month to update.
     * @param {string} field - The name of the field to update.
     * @param {string} value - The new value for the field.
     */
    const updateMonth = (id, field, value) => {
        const updatedMonths = months.map(m =>
            m.id === id ? { ...m, [field]: value === '' ? 0 : parseFloat(value) || 0 } : m
        );
        setMonths(updatedMonths);
        setYearData({ ...yearData, [selectedYear]: updatedMonths });
    };

    /**
     * Calculates the percentage variance between actual and budget values.
     * @param {number} actual - The actual value.
     * @param {number} budget - The budgeted value.
     * @returns {string} The variance percentage, formatted to one decimal place.
     */
    const calculateVariance = (actual, budget) => {
        if (budget === 0) return '0.0';
        return (((actual - budget) / budget) * 100).toFixed(1);
    };

    // Memoized calculations for totals to optimize performance.
    const totals = useMemo(() => {
        const salesActual = months.reduce((sum, m) => sum + m.salesActual, 0);
        const salesBudget = months.reduce((sum, m) => sum + m.salesBudget, 0);
        const wagesActual = months.reduce((sum, m) => sum + m.wagesActual, 0);
        const wagesBudget = months.reduce((sum, m) => sum + m.wagesBudget, 0);
        const overheadsActual = months.reduce((sum, m) => sum + m.overheadsActual, 0);
        const overheadsBudget = months.reduce((sum, m) => sum + m.overheadsBudget, 0);
        const profitActual = salesActual - wagesActual - overheadsActual;
        const profitBudget = salesBudget - wagesBudget - overheadsBudget;

        return {
            salesActual, salesBudget,
            wagesActual, wagesBudget,
            overheadsActual, overheadsBudget,
            profitActual, profitBudget,
        };
    }, [months]);

    // Memoized data transformation for the profit chart.
    const profitData = useMemo(() => months.map(month => ({
        name: month.name,
        profitBudget: month.salesBudget - month.wagesBudget - month.overheadsBudget,
        profitActual: month.salesActual - month.wagesActual - month.overheadsActual
    })), [months]);

    /**
     * Generates commentary for a specific data type using the Gemini API.
     * @param {'sales' | 'wages' | 'overheads' | 'profit'} dataType - The category for which to generate commentary.
     */
    const generateCommentary = async (dataType) => {
        setIsGenerating(prev => ({ ...prev, [dataType]: true }));
        const systemPrompt = "You are a senior financial analyst. Provide a brief, insightful, and professional commentary on the provided financial data. Focus on performance against budget, key variances, and potential trends. The currency is GBP (£).";
        
        // Select the correct data source and keys based on the dataType
        const dataForAnalysis = dataType === 'profit' ? profitData : months;
        const actualKey = dataType === 'profit' ? 'profitActual' : `${dataType}Actual`;
        const budgetKey = dataType === 'profit' ? 'profitBudget' : `${dataType}Budget`;

        const dataSummary = dataForAnalysis.map(m => 
            `${m.name}: Actual £${(m[actualKey] || 0).toLocaleString()}, Budget £${(m[budgetKey] || 0).toLocaleString()}`
        ).join('; ');

        const userQuery = `Analyze the following monthly ${dataType} data for fiscal year ${selectedYear} and provide commentary:\n${dataSummary}`;
        
        try {
             const apiKey = "";
             const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

             const payload = {
                 contents: [{ parts: [{ text: userQuery }] }],
                 systemInstruction: {
                     parts: [{ text: systemPrompt }]
                 },
             };

             const response = await fetch(apiUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(payload)
             });

             if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
             }

             const result = await response.json();
             const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

             if (text) {
                if (dataType === 'sales') setSalesCommentary(text);
                else if (dataType === 'wages') setWagesCommentary(text);
                else if (dataType === 'overheads') setOverheadsCommentary(text);
                else if (dataType === 'profit') setProfitCommentary(text);
             } else {
                throw new Error("No content received from API.");
             }
        } catch (error) {
            console.error('Error generating commentary:', error);
            const fallbackText = `Failed to generate AI commentary for ${dataType}. Please check your connection or try again later.`;
            if (dataType === 'sales') setSalesCommentary(fallbackText);
            else if (dataType === 'wages') setWagesCommentary(fallbackText);
            else if (dataType === 'overheads') setOverheadsCommentary(fallbackText);
            else if (dataType === 'profit') setProfitCommentary(fallbackText);
        } finally {
            setIsGenerating(prev => ({ ...prev, [dataType]: false }));
        }
    };


    // A generic component for rendering charts.
    const renderChart = (data, dataKeys, colors, type) => {
        const ChartComponent = type === 'line' ? LineChart : type === 'area' ? AreaChart : BarChart;
        return (
            <ResponsiveContainer width="100%" height={200}>
                <ChartComponent data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="name" stroke="#99f6e4" fontSize={12} />
                    <YAxis stroke="#99f6e4" fontSize={12} tickFormatter={(value) => `£${(value/1000)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f766e', border: '1px solid #14b8a6', borderRadius: '0.5rem' }} labelStyle={{ color: '#ccfbf1' }} formatter={(value) => `£${value.toLocaleString()}`} />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    {type === 'bar' && dataKeys.map((key, idx) => <Bar key={key} dataKey={key} fill={colors[idx]} name={key.includes('Budget') ? 'Budget' : 'Actual'} radius={[4, 4, 0, 0]} />)}
                    {type === 'line' && dataKeys.map((key, idx) => <Line key={key} type="monotone" dataKey={key} stroke={colors[idx]} strokeWidth={2} name={key.includes('Budget') ? 'Budget' : 'Actual'} dot={{ r: 4 }} activeDot={{ r: 6 }} />)}
                    {type === 'area' && dataKeys.map((key, idx) => <Area key={key} type="monotone" dataKey={key} fill={colors[idx]} stroke={colors[idx]} name={key.includes('Budget') ? 'Budget' : 'Actual'} fillOpacity={0.4} />)}
                </ChartComponent>
            </ResponsiveContainer>
        );
    };
    
    // JSX for the main application UI.
    return (
        <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .print-break-before { page-break-before: always; }
                    .print-bg-white { background-color: white !important; }
                }
            `}</style>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto print-container">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <AVELogo />
                            <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">Budget & Forecasting Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-3 no-print">
                            <label className="text-gray-600 font-medium text-sm hidden sm:block">Fiscal Year:</label>
                            <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-md shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm">
                                <option value="25/26">25/26</option>
                                <option value="24/25">24/25</option>
                            </select>
                            <button onClick={() => window.print()} className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md shadow-sm flex items-center gap-2 text-sm transition">
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6 print-bg-white">
                         <h2 className="text-teal-700 text-xl font-semibold mb-3">Executive Summary</h2>
                         <textarea value={executiveSummary} onChange={(e) => setExecutiveSummary(e.target.value)} className="w-full h-28 p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500 text-sm" placeholder="Enter your executive summary here..." />
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6 print-bg-white">
                        <div className="flex justify-between items-start mb-4">
                           <h2 className="text-2xl font-bold text-teal-800">Monthly Performance Data</h2>
                           <button onClick={() => setShowInputTable(!showInputTable)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm transition font-medium no-print">
                                {showInputTable ? 'Hide Table' : 'Show Table'}
                           </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 no-print">
                            <button onClick={addMonth} disabled={months.length >= 12} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Plus className="w-4 h-4" /> Add Month
                            </button>
                            <button onClick={removeLastMonth} disabled={months.length <= 1} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Trash2 className="w-4 h-4" /> Remove Last
                            </button>
                            <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition flex items-center gap-2 cursor-pointer font-medium">
                                <Upload className="w-4 h-4" /> Upload CSV
                                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                        
                        {showInputTable && (
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-gray-800 text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left py-3 px-3 font-semibold text-gray-600 sticky left-0 bg-gray-100 z-10">Month</th>
                                            {['Sales', 'Wages', 'Overheads', 'Net Profit'].map(category => (
                                               <th key={category} colSpan="3" className="text-center py-3 px-3 font-semibold text-gray-600 border-l border-gray-300">{category}</th>
                                            ))}
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <th className="sticky left-0 bg-gray-50 z-10"></th>
                                            {Array(4).fill(0).map((_, i) => (
                                               <React.Fragment key={i}>
                                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500 border-l border-gray-300">Budget</th>
                                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Actual</th>
                                                  <th className="text-center py-2 px-2 text-xs font-medium text-gray-500">Var%</th>
                                               </React.Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {months.map((month, index) => {
                                            const profitBudget = month.salesBudget - month.wagesBudget - month.overheadsBudget;
                                            const profitActual = month.salesActual - month.wagesActual - month.overheadsActual;
                                            const getVarClass = (v, isCost = false) => parseFloat(v) > 0 ? (isCost ? 'text-red-600' : 'text-green-600') : (isCost ? 'text-green-600' : 'text-red-600');

                                            return (
                                                <tr key={month.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="py-2 px-3 font-semibold text-gray-700 sticky left-0 bg-inherit z-10">{month.name}</td>
                                                    {/* Sales */}
                                                    <td className="py-2 px-2 border-l border-gray-200"><input type="number" value={month.salesBudget} onChange={(e) => updateMonth(month.id, 'salesBudget', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className="py-2 px-2"><input type="number" value={month.salesActual} onChange={(e) => updateMonth(month.id, 'salesActual', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className={`py-2 px-2 text-center font-bold ${getVarClass(calculateVariance(month.salesActual, month.salesBudget))}`}>{calculateVariance(month.salesActual, month.salesBudget)}%</td>
                                                    {/* Wages */}
                                                    <td className="py-2 px-2 border-l border-gray-200"><input type="number" value={month.wagesBudget} onChange={(e) => updateMonth(month.id, 'wagesBudget', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className="py-2 px-2"><input type="number" value={month.wagesActual} onChange={(e) => updateMonth(month.id, 'wagesActual', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className={`py-2 px-2 text-center font-bold ${getVarClass(calculateVariance(month.wagesActual, month.wagesBudget), true)}`}>{calculateVariance(month.wagesActual, month.wagesBudget)}%</td>
                                                    {/* Overheads */}
                                                    <td className="py-2 px-2 border-l border-gray-200"><input type="number" value={month.overheadsBudget} onChange={(e) => updateMonth(month.id, 'overheadsBudget', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className="py-2 px-2"><input type="number" value={month.overheadsActual} onChange={(e) => updateMonth(month.id, 'overheadsActual', e.target.value)} className="bg-white text-gray-800 rounded px-2 py-1 w-24 text-right border border-gray-300 focus:ring-1 focus:ring-teal-500 focus:outline-none" /></td>
                                                    <td className={`py-2 px-2 text-center font-bold ${getVarClass(calculateVariance(month.overheadsActual, month.overheadsBudget), true)}`}>{calculateVariance(month.overheadsActual, month.overheadsBudget)}%</td>
                                                    {/* Profit */}
                                                    <td className={`py-2 px-2 text-right font-semibold border-l border-gray-200`}>£{profitBudget.toLocaleString()}</td>
                                                    <td className={`py-2 px-2 text-right font-semibold`}>£{profitActual.toLocaleString()}</td>
                                                    <td className={`py-2 px-2 text-center font-bold ${getVarClass(calculateVariance(profitActual, profitBudget))}`}>{calculateVariance(profitActual, profitBudget)}%</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 print-bg-white">
                         {[
                            { title: 'Total Sales', actual: totals.salesActual, budget: totals.salesBudget, color: 'green', isCost: false },
                            { title: 'Total Wages', actual: totals.wagesActual, budget: totals.wagesBudget, color: 'amber', isCost: true },
                            { title: 'Total Overheads', actual: totals.overheadsActual, budget: totals.overheadsBudget, color: 'blue', isCost: true },
                            { title: 'Net Profit', actual: totals.profitActual, budget: totals.profitBudget, color: 'teal', isCost: false }
                         ].map(item => {
                            const variance = parseFloat(calculateVariance(item.actual, item.budget));
                            const isFavorable = item.isCost ? variance <= 0 : variance >= 0;
                            return (
                                <div key={item.title} className={`bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-lg p-4 text-white shadow-sm`}>
                                    <p className={`text-${item.color}-100 mb-1 text-sm`}>{item.title}</p>
                                    <p className="text-2xl font-bold">£{item.actual.toLocaleString()}</p>
                                    <div className="flex justify-between items-baseline mt-1">
                                       <p className={`text-xs text-${item.color}-200`}>Budget: £{item.budget.toLocaleString()}</p>
                                       <p className={`text-sm font-semibold rounded-full px-2 py-0.5 ${isFavorable ? 'bg-green-100/30' : 'bg-red-100/30'}`}>{variance}%</p>
                                    </div>
                                </div>
                            )
                         })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print-break-before">
                        {[
                           { title: 'Sales', data: months, keys: ['salesBudget', 'salesActual'], colors: ['#5eead4', '#2dd4bf'], commentary: salesCommentary, setCommentary: setSalesCommentary, type: 'sales' },
                           { title: 'Wages', data: months, keys: ['wagesBudget', 'wagesActual'], colors: ['#fcd34d', '#fbbf24'], commentary: wagesCommentary, setCommentary: setWagesCommentary, type: 'wages' },
                           { title: 'Overheads', data: months, keys: ['overheadsBudget', 'overheadsActual'], colors: ['#93c5fd', '#60a5fa'], commentary: overheadsCommentary, setCommentary: setOverheadsCommentary, type: 'overheads' },
                           { title: 'Net Profit', data: profitData, keys: ['profitBudget', 'profitActual'], colors: ['#86efac', '#4ade80'], commentary: profitCommentary, setCommentary: setProfitCommentary, type: 'profit' }
                        ].map(chart => (
                           <div key={chart.title} className="bg-teal-800 rounded-lg p-4 border border-teal-700 shadow-lg print-bg-white">
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="text-white text-lg font-semibold">{chart.title} Performance</h2>
                                    <select value={chartTypes[chart.type]} onChange={(e) => setChartTypes({...chartTypes, [chart.type]: e.target.value})} className="bg-teal-700 text-white text-xs px-2 py-1 rounded border border-teal-600 focus:ring-1 focus:ring-teal-500 focus:outline-none no-print">
                                        <option value="bar">Bar</option>
                                        <option value="line">Line</option>
                                        <option value="area">Area</option>
                                    </select>
                                </div>
                                {renderChart(chart.data, chart.keys, chart.colors, chartTypes[chart.type])}
                                {chart.setCommentary && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                           <h3 className="text-teal-200 font-semibold text-sm">Commercial Commentary</h3>
                                           <button 
                                                onClick={() => generateCommentary(chart.type)} 
                                                disabled={isGenerating[chart.type]}
                                                className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-md text-xs transition flex items-center gap-1.5 font-medium disabled:bg-teal-800 disabled:cursor-wait no-print"
                                            >
                                               <Sparkles className={`w-3.5 h-3.5 ${isGenerating[chart.type] ? 'animate-spin' : ''}`} />
                                               {isGenerating[chart.type] ? 'Generating...' : 'Generate AI Insight'}
                                            </button>
                                        </div>
                                        <textarea value={chart.commentary} onChange={(e) => chart.setCommentary(e.target.value)} className="w-full h-24 p-3 bg-teal-900/50 text-teal-100 rounded-lg border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-teal-400 text-sm" placeholder={`Enter ${chart.title.toLowerCase()} commentary...`} />
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>

                </div>
            </div>
        </>
    );
}







