import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';

// Tooltip (mouse hover karne par dikhne wala popup) ka style
const TOOLTIP_STYLE = {
  background: '#1e293b', // dark background
  border: 'none',
  borderRadius: '8px',
  color: '#f1f5f9', // light text
  fontSize: '12px',
};

// Chart ke colors ki list — har data series ko ek alag color milega
const CARD = {
  stroke: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#ec4899'],
};

// DailyTrendChart: 30 din ke deposits vs withdrawals ka Area (area) chart.
// Area = line ke niche color bhar deta hai.
export function DailyTrendChart({ data, height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#64748b33" /> {/* background grid lines */}
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" /> {/* bottom axis = date */}
        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" /> {/* left axis = amount */}
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend /> {/* colors ki explanation */}
        {/* Green line = deposits, orange line = withdrawals */}
        <Area type="monotone" dataKey="deposits" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
        <Area type="monotone" dataKey="withdrawals" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ComparisonBarChart: branch-wise revenue vs expenses vs profit ka bar chart
export function ComparisonBarChart({ data, height = 300, xKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#64748b33" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#64748b" /> {/* har bar group ek branch ka */}
        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#64748b22' }} />
        <Legend />
        {/* Har bar ek series: revenue (indigo), expenses (red), profit (green) */}
        <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// MultiLineChart: multiple lines wala chart (future use ke liye).
// keys = kitni lines dikhani hain, colors = unka color.
export function MultiLineChart({ data, height = 300, keys, colors }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#64748b33" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
        <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend />
        {/* Har key ke liye ek line banao */}
        {keys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={colors[i] || CARD.stroke[i]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// TypePieChart: donut chart (beech me khokhla circle) — data ka hissa dikhata hai.
// Jaise deposits vs withdrawals ka percentage share.
export function TypePieChart({ data, height = 280, labelKey = 'name', valueKey = 'value' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        {/* innerRadius = donut ka andar ka hole, outerRadius = bahar ki taraf */}
        <Pie data={data} dataKey={valueKey} nameKey={labelKey} innerRadius={60} outerRadius={100} paddingAngle={2}>
          {/* Har slice ko apna color do (CARD.stroke list se) */}
          {data.map((_, i) => <Cell key={i} fill={CARD.stroke[i % CARD.stroke.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}