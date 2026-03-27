import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  Search, 
  Download, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const pieData = [
  { name: 'Tech', value: 45 },
  { name: 'Business', value: 25 },
  { name: 'Creative', value: 20 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#9333ea', '#ec4899', '#6366f1', '#f43f5e'];

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-gray-500">Welcome back, Nobztech Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-purple-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-purple-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all">
            Post New Role
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Talent", value: "15,420", change: "+12.5%", trend: "up", icon: Users },
          { label: "Active Roles", value: "1,245", change: "+5.2%", trend: "up", icon: TrendingUp },
          { label: "Hired This Month", value: "384", change: "-2.1%", trend: "down", icon: UserCheck },
          { label: "Avg. Time to Hire", value: "18 Days", change: "+1.4%", trend: "up", icon: Clock }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-purple-50 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <stat.icon size={24} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Talent Growth</h2>
            <select className="bg-purple-50 border-none rounded-lg text-xs font-bold text-purple-700 px-3 py-1 focus:ring-0">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f5f3ff' }}
                />
                <Bar dataKey="value" fill="#9333ea" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-purple-50 shadow-sm space-y-8">
          <h2 className="text-xl font-bold">Career Interests</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Talent Table */}
      <div className="bg-white rounded-[2.5rem] border border-purple-50 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-purple-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Top Talent Matches</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className="pl-10 pr-4 py-2 bg-purple-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-purple-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-8 py-4">Candidate</th>
                <th className="px-8 py-4">Recommended Path</th>
                <th className="px-8 py-4">Readiness</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {[
                { name: "Nompumelelo D.", path: "Software Developer", readiness: "95%", status: "Available", img: "https://picsum.photos/seed/n/40/40" },
                { name: "Lerato M.", path: "Data Analyst", readiness: "88%", status: "Interviewing", img: "https://picsum.photos/seed/l/40/40" },
                { name: "Sarah K.", path: "UX Designer", readiness: "92%", status: "Available", img: "https://picsum.photos/seed/s/40/40" },
                { name: "Zanele T.", path: "Digital Marketing", readiness: "84%", status: "Hired", img: "https://picsum.photos/seed/z/40/40" }
              ].map((talent, i) => (
                <tr key={i} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <img src={talent.img} alt={talent.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-gray-900">{talent.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-600">{talent.path}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: talent.readiness }}></div>
                      </div>
                      <span className="text-xs font-bold text-purple-700">{talent.readiness}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      talent.status === 'Available' ? "bg-green-50 text-green-600" : 
                      talent.status === 'Interviewing' ? "bg-blue-50 text-blue-600" : 
                      "bg-gray-50 text-gray-400"
                    )}>
                      {talent.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-purple-50/50 text-center">
          <button className="text-purple-600 font-bold text-sm hover:underline">View All Candidates</button>
        </div>
      </div>
    </div>
  );
}
