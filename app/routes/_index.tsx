import type { MetaFunction } from "@remix-run/node";
import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import ReactSlider from "react-slider";

export const meta: MetaFunction = () => {
  return [
    { title: "Poetry in the Woods" },
    {
      name: "description",
      content: "Create poetry in a serene woodland setting",
    },
  ];
};

export default function Index() {
  const [poem, setPoem] = useState("");
  const [isHandwritten, setIsHandwritten] = useState(true);
  const [isOldPaper, setIsOldPaper] = useState(true);
  const [quote, setQuote] = useState(
    '"Simplify, simplify." - Henry David Thoreau'
  );
  const [title, setTitle] = useState("Poetry in the Woods");
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const poetryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimLevel, setDimLevel] = useState(30);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.transition = "background-color 0.5s ease";
    }
  }, []);

  const fontClass = isHandwritten
    ? "font-['Caveat',_cursive]"
    : "font-['Courier_Prime',_monospace]";

  const paperClass = isOldPaper ? "bg-[#f4e5c9]" : "bg-white";

  const overlayOpacity = dimLevel / 100;

  const handleShare = useCallback(async () => {
    if (poetryRef.current) {
      // Create a temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      document.body.appendChild(tempContainer);

      // Create the frame
      const frame = document.createElement("div");
      frame.style.width = `${poetryRef.current.offsetWidth + 64}px`; // Add 32px padding on each side
      frame.style.height = `${poetryRef.current.offsetHeight + 64}px`; // Add 32px padding on each side
      frame.style.backgroundImage = "url('/wood.jpg')";
      frame.style.backgroundSize = "cover";
      frame.style.backgroundPosition = "center";
      frame.style.position = "relative";
      frame.style.padding = "32px";

      // Add dimming overlay
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      // biome-ignore lint/style/useTemplate: <explanation>
      overlay.style.backgroundColor = "rgba(0, 0, 0, " + overlayOpacity + ")";
      frame.appendChild(overlay);

      // Clone the poetry content
      const poetryClone = poetryRef.current.cloneNode(true) as HTMLElement;
      poetryClone.style.position = "relative";
      poetryClone.style.zIndex = "1";
      frame.appendChild(poetryClone);

      tempContainer.appendChild(frame);

      // Capture the frame
      const canvas = await html2canvas(frame, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 2, // Increase resolution
      });

      // Clean up
      document.body.removeChild(tempContainer);

      const image = canvas.toDataURL("image/png");
      setImageUrl(image);
      setShowModal(true);
    }
  }, [overlayOpacity]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "my_poetry.png";
    link.click();
  };

  const handleSocialShare = async (platform: string) => {
    const shareData = {
      title: "My Poetry",
      text: "Check out my poem!",
      url: window.location.href,
    };

    if (navigator.share && platform === "native") {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      let shareUrl = "";
      switch (platform) {
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareData.text
          )}&url=${encodeURIComponent(shareData.url)}`;
          break;
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareData.url
          )}`;
          break;
        case "instagram":
          // Instagram doesn't have a direct sharing URL, so we'll copy the link to clipboard
          await navigator.clipboard.writeText(shareData.url);
          alert(
            "Link copied to clipboard. You can now paste it into Instagram."
          );
          return;
        default:
          console.error("Unsupported platform");
          return;
      }
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/wood.jpg')" }}
    >
      <div
        className="absolute inset-0 bg-black transition-opacity duration-500"
        style={{ opacity: overlayOpacity }}
      />
      <div
        ref={poetryRef}
        className={`w-full max-w-4xl ${paperClass} shadow-2xl rounded-lg overflow-hidden relative mb-4 transition-shadow duration-500 z-10`}
        style={{
          boxShadow: `0 0 ${dimLevel / 2}px ${
            dimLevel / 4
          }px rgba(255, 191, 0, ${dimLevel / 200})`,
        }}
      >
        <div className="p-12">
          {" "}
          {/* Increased padding */}
          {isOldPaper && (
            <>
              <div className="absolute inset-0 bg-[url('/old-paper.avif')] opacity-50 bg-cover bg-center" />
            </>
          )}
          <div className="relative z-10 flex flex-col min-h-[80vh]">
            <input
              type="text"
              className={`text-4xl mb-8 text-center text-brown-800 w-full bg-transparent border-none focus:outline-none ${fontClass}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className={`w-full flex-grow p-6 bg-transparent border-none rounded focus:outline-none text-xl resize-none ${fontClass}`}
              placeholder="I went to the woods because I wished to live deliberately..."
              value={poem}
              onChange={(e) => setPoem(e.target.value)}
            />
            <textarea
              className={`mt-auto text-center text-sm text-gray-600 font-serif italic bg-transparent border-none focus:outline-none resize-none w-full ${fontClass}`}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 z-10 bg-[#f4e5c9] bg-opacity-90 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <span
              className={`${isHandwritten ? "font-bold" : ""} text-brown-800`}
            >
              Handwritten
            </span>
            <label
              className="inline-flex items-center cursor-pointer"
              htmlFor="handwrittenToggle"
            >
              <span className="sr-only">Toggle handwritten mode</span>
              <div className="relative">
                <input
                  id="handwrittenToggle"
                  type="checkbox"
                  className="sr-only peer"
                  checked={!isHandwritten}
                  onChange={() => setIsHandwritten(!isHandwritten)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-600" />
              </div>
            </label>
            <span
              className={`${!isHandwritten ? "font-bold" : ""} text-brown-800`}
            >
              Typewriter
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`${isOldPaper ? "font-bold" : ""} text-brown-800`}>
              Old Paper
            </span>
            <label
              className="inline-flex items-center cursor-pointer"
              htmlFor="paperToggle"
            >
              <span className="sr-only">Toggle paper style</span>
              <div className="relative">
                <input
                  id="paperToggle"
                  type="checkbox"
                  className="sr-only peer"
                  checked={!isOldPaper}
                  onChange={() => setIsOldPaper(!isOldPaper)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brown-600" />
              </div>
            </label>
            <span
              className={`${!isOldPaper ? "font-bold" : ""} text-brown-800`}
            >
              White Paper
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-brown-800">Bright</span>
            <ReactSlider
              className="w-32 h-8 flex items-center"
              thumbClassName="w-6 h-6 bg-amber-500 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 cursor-pointer"
              trackClassName="h-2 bg-gray-200 rounded-full"
              value={dimLevel}
              onChange={(value) => setDimLevel(value)}
              min={0}
              max={100}
            />
            <span className="text-brown-800">Dim</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded transition-colors text-lg w-full sm:w-auto"
        >
          Share
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Share Your Poetry</h2>
            <div className="aspect-w-4 aspect-h-5 mb-4">
              <img
                src={imageUrl}
                alt="Generated Poetry"
                className="object-contain w-full h-full rounded"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleDownload}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 w-full"
              >
                Download
              </button>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialShare("native")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare("twitter")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Twitter
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare("facebook")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialShare("instagram")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Instagram
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mt-4 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
