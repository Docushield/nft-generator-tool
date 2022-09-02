const ProgressBar = ({ progressPercentage }) => {
	return (
		<div className='h-2 w-full bg-gray rounded overflow-hidden bg-re'>
			<div
				style={{ width: `${progressPercentage}%` }}
				className={`h-full ${
					progressPercentage < 70 ? 'bg-red' : 'bg-green'
				}`}
			></div>
		</div>
	);
};

export default ProgressBar;