import SliceTab from "@/components/slicing/slice-tab";

export default function SlicePage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold font-rajdhani tracking-tight text-white">Slicer Configuration</h1>
                <p className="text-zinc-400">
                    Upload models, configure slicer settings, and generate G-code for your printers.
                </p>
            </div>

            <div className="w-full flex justify-center mt-8">
                <SliceTab/>
            </div>
        </div>
    );
}
