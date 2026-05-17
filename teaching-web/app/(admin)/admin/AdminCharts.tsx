'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600 },
  itemStyle: { color: 'hsl(var(--muted-foreground))' },
}

export interface AdminChartsData {
  sourcesByStatus: { name: string; value: number }[]
  modulesByStatus: { name: string; value: number }[]
  signupsByDay: { date: string; users: number }[]
  feedbackByDay: { date: string; total: number; pending: number }[]
}

export function AdminCharts({ data }: { data: AdminChartsData }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sources by review status</CardTitle>
          <CardDescription>Phân bổ pipeline source governance.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.sourcesByStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={(d) => `${d.name}: ${d.value}`}
                labelLine={false}
                fontSize={10}
              >
                {data.sourcesByStatus.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Modules by status</CardTitle>
          <CardDescription>DRAFT → IN_REVIEW → PUBLISHED.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.modulesByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Signups (14 ngày)</CardTitle>
          <CardDescription>User mới đăng ký, cộng dồn theo ngày.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.signupsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI feedback volume (14 ngày)</CardTitle>
          <CardDescription>Tổng số chấm AI + số đang chờ review.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.feedbackByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }} />
              <Bar dataKey="total" fill="hsl(var(--chart-2))" name="Tổng" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="hsl(var(--chart-3))" name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
