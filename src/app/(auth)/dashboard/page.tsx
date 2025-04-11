// src/app/(auth)/dashboard/page.tsx
import DashboardContent from "./components/DashboardContent";

export default function DashboardPage() {
	return (
		<div>
			<h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
			<DashboardContent />
		</div>
	);
}
