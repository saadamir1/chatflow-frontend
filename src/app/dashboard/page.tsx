import DashboardOverview from '../../components/dashboard/DashboardOverview';
import AuthGuard from '../../components/common/AuthGuard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardOverview />
    </AuthGuard>
  );
}