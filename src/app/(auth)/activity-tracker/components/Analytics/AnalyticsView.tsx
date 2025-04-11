import React from "react";
import TimeFrameSelector from "../../ViewControls/TimeFrameSelector";
import ActivityBarChart from "../Charts/ActivityBarChart";

const AnalyticsView: React.FC = () => {
	return (
		<div className='bg-white rounded-lg shadow-md p-6'>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-xl font-semibold text-gray-800'>
					Activity Analytics
				</h2>
				<TimeFrameSelector />
			</div>

			<div className='mb-8'>
				<ActivityBarChart />
			</div>

			{/* Will add more charts here in the future */}
		</div>
	);
};

export default AnalyticsView;
