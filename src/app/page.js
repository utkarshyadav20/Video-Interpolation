"use client";
import { useState } from "react";
import useSWR from "swr";
// import axios from 'axios'

export default function Home() {
  const [files, setFiles] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: videoUrl, mutate: vide1Mutate } = useSWR("/api/video");

  const { data: rvideoUrl, mutate: viderMutate } = useSWR("/api/rvideo");

  const [isNprocessing, setIsNProcessing] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData();
    formData.append("image1", files.image1);
    formData.append("image2", files.image2);
    // console.log(files.image1)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      vide1Mutate("/api/video");
      console.log(videoUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRUpload = async (e) => {
    e.preventDefault();
    setIsNProcessing(true);

    const formData = new FormData();
    formData.append("image1", files.image1);
    formData.append("image2", files.image2);
    // console.log(files.image1)

    try {
      const response = await fetch("/api/rupload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));

      viderMutate("/api/rvideo");
      console.log(rvideoUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsNProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary">
          FILM Video Interpolation
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="sr-only">Choose first image</span>
              <input
                type="file"
                onChange={(e) =>
                  setFiles({ ...files, image1: e.target.files[0] })
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-primary"
                accept="image/*"
                required
              />
            </label>

            <label className="block">
              <span className="sr-only">Choose second image</span>
              <input
                type="file"
                onChange={(e) =>
                  setFiles({ ...files, image2: e.target.files[0] })
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-primary"
                accept="image/*"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Generate Video"}
          </button>
        </form>
        {videoUrl && (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video controls className="w-full h-full" key={videoUrl}>
              <source src="/output.mp4" type="video/mp4" />
            </video>
          </div>
        )}

        {videoUrl && (
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-center text-primary">
              Increase the number of frames
            </h1>

            <form onSubmit={handleRUpload} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="sr-only">Choose first image</span>
                  <input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, image1: e.target.files[0] })
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-primary"
                    accept="image/*"
                    required
                  />
                </label>

                <label className="block">
                  <span className="sr-only">Choose second image</span>
                  <input
                    type="file"
                    onChange={(e) =>
                      setFiles({ ...files, image2: e.target.files[0] })
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-white hover:file:bg-primary"
                    accept="image/*"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isNprocessing}
                className="w-full px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNprocessing ? "Processing..." : "Generate Video"}
              </button>
            </form>
            {rvideoUrl && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video controls className="w-full h-full" key={rvideoUrl}>
                  <source src="/output1.mp4" type="video/mp4" />
                </video>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
