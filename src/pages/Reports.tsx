import { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { BarChart as BarIcon, Download, Sparkles, Filter, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { documents } = useAppContext();
  
  const [filterVendor, setFilterVendor] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('All'); // All, Last 30, Last 90
  const [filterMinAmount, setFilterMinAmount] = useState('');
  
  const uniqueVendors = Array.from(new Set(documents.map(d => d.vendor)));

  // Filter logic including all requested parameters
  const filteredData = useMemo(() => {
    const now = new Date();
    return documents.filter(doc => {
      const vMatch = filterVendor === 'All' || doc.vendor === filterVendor;
      const sMatch = filterStatus === 'All' || doc.status === filterStatus;
      
      let dMatch = true;
      if (filterDateRange === '30') {
        const docDate = new Date(doc.date);
        dMatch = (now.getTime() - docDate.getTime()) <= 30 * 86400000;
      } else if (filterDateRange === '90') {
        const docDate = new Date(doc.date);
        dMatch = (now.getTime() - docDate.getTime()) <= 90 * 86400000;
      }

      let aMatch = true;
      if (filterMinAmount) {
        aMatch = doc.amount >= parseFloat(filterMinAmount);
      }

      return vMatch && sMatch && dMatch && aMatch;
    });
  }, [documents, filterVendor, filterStatus, filterDateRange, filterMinAmount]);

  const chartData = useMemo(() => {
    const map = new Map();
    filteredData.forEach(doc => {
      if (doc.status !== 'Approved') return;
      
      const dateObj = new Date(doc.date);
      const month = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' });
      const sortKey = dateObj.getFullYear() * 100 + dateObj.getMonth();
      const current = map.get(month) || { name: month, amount: 0, sortKey };
      const netAmount = doc.type === 'Credit Note' ? -doc.amount : doc.amount;
      map.set(month, { ...current, amount: current.amount + netAmount });
    });
    return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [filteredData]);

  const totalSpend = filteredData.reduce((acc, curr) => acc + (curr.type === 'Credit Note' ? -curr.amount : curr.amount), 0);
  const totalVAT = filteredData.reduce((acc, curr) => acc + (curr.type === 'Credit Note' ? -curr.vat : curr.vat), 0);
  const pendingSpend = filteredData.filter(d => d.status === 'Pending').reduce((acc, curr) => acc + (curr.type === 'Credit Note' ? -curr.amount : curr.amount), 0);
  const approvedSpend = filteredData.filter(d => d.status === 'Approved').reduce((acc, curr) => acc + (curr.type === 'Credit Note' ? -curr.amount : curr.amount), 0);

  const generateInsights = () => {
    if (filteredData.length === 0) return ["Not enough data to generate AI insights."];
    const insights = [];
    
    // Spending Trends
    if (chartData.length >= 2) {
      const recent = chartData[chartData.length - 1].amount;
      const prev = chartData[chartData.length - 2].amount;
      if (recent > prev * 1.5) insights.push(`Spending trend alert: A severe 50%+ spike in spending was detected in ${chartData[chartData.length - 1].name}.`);
      else if (recent < prev * 0.8) insights.push(`Net spend decreased due to high credit note activity in ${chartData[chartData.length - 1].name}.`);
      else insights.push("Spending trends over time appear stable across the selected range.");
    } else {
      insights.push(`Total spend over this period is $${totalSpend.toFixed(2)}. Gather more historical data for trend matching.`);
    }

    // Unusual transactions (Anomalies)
    const avgSpend = totalSpend / filteredData.length;
    let anomalyCount = 0;
    filteredData.forEach(d => {
      if (d.amount > avgSpend * 3) anomalyCount++;
    });
    if (anomalyCount > 0) insights.push(`Anomaly Detection: Spotted ${anomalyCount} highly unusual transaction(s) exceeding 3x the average magnitude.`);

    // Vendor Concentration risks
    const vendorMap: Record<string, number> = {};
    filteredData.forEach(d => { 
      const netAmount = d.type === 'Credit Note' ? -d.amount : d.amount;
      vendorMap[d.vendor] = (vendorMap[d.vendor] || 0) + netAmount; 
    });
    const topVendor = Object.entries(vendorMap).sort((a,b) => b[1] - a[1])[0];
    if (topVendor && topVendor[1] > totalSpend * 0.5 && totalSpend > 0) {
      insights.push(`Vendor Concentration Risk: Over 50% of your spend is concentrated on a single supplier (${topVendor[0]}).`);
    }

    // High VAT patterns
    if (totalVAT > totalSpend * 0.22) {
      insights.push("High VAT Pattern: The aggregated tax load on these documents exceeds expected local standard averages. Review origin territories.");
    }

    if (insights.length < 3) {
      insights.push("No immediate compliance risks or massive anomalies detected in this set.");
    }

    return insights;
  };

  const insights = useMemo(generateInsights, [filteredData, totalSpend, chartData, totalVAT]);

  // Export functions
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("NexVault Spend Summary Report", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Invoice #', 'Vendor', 'Date', 'Type', 'Status', 'Amount ($)', 'VAT ($)']],
      body: filteredData.map(d => [d.invoiceNumber, d.vendor, new Date(d.date).toLocaleDateString(), d.type, d.status, d.amount.toFixed(2), d.vat.toFixed(2)]),
    });
    doc.save("NexVault_Report.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(d => ({
      Invoice: d.invoiceNumber, Vendor: d.vendor, Date: d.date, Type: d.type, Status: d.status, Amount: d.amount, VAT: d.vat
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "NexVault_Report.xlsx");
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Reports & Insights</h1>
          <p className="text-secondary">Analyze your document spending, taxes, and approvals.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary text-gradient" onClick={exportPDF}>
            <FileText size={18} /> Export PDF
          </button>
          <button className="btn btn-secondary" onClick={exportExcel} style={{ color: '#10b981' }}>
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Date Range</label>
          <select className="form-input" value={filterDateRange} onChange={e => setFilterDateRange(e.target.value)}>
            <option value="All">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Filter size={14}/> Vendor</label>
          <select className="form-input" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}>
            <option value="All">All Vendors</option>
            {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Approval Status</label>
          <select className="form-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Min Amount ($)</label>
          <input type="number" className="form-input" placeholder="0" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(280px, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <BarIcon size={24} className="text-secondary" />
            <h3>Spending Trends Over Time</h3>
          </div>
          
          {chartData.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="amount" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No chart data for current filters
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <div className="glass-card" style={{ padding: '1.5rem', flex: 1, borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's coming</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Spend</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: '#f59e0b' }}>
                ${pendingSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem', flex: 1, borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's confirmed</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Approved Spend</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, color: '#10b981' }}>
                ${approvedSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '2rem', flex: 2, background: 'rgba(99, 102, 241, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
              <Sparkles size={20} />
              <h4 style={{ color: 'var(--text-primary)' }}>NexVault AI Insights</h4>
            </div>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.map((insight, idx) => (
                <li key={idx} style={{ lineHeight: 1.4, fontSize: '0.95rem' }}>{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
