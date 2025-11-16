const ProgressBar = ({ progress }) => {
    return (
        <>
            <div className="bg-zinc-900 w-full h-6 place-content-center">
                <div
                    style={{ transform: `scaleX(${progress})` }}
                    className={`bg-green-500 origin-left p-2 mx-1`}>
                </div>
            </div >
        </>
    )
}

export default ProgressBar;