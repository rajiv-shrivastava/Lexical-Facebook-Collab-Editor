import React, { useEffect, useState, useRef } from 'react';

// Spinner only UI
const Spinner = () => (
  <></>
);

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  const downloadTimeout = useRef(null);
  const uploadTimeout = useRef(null);

  // Download speed test
  const measureDownloadSpeed = () => {
    setIsDownloading(true);
    const image = new Image();
    const imageSizeBytes = 200000;
    const startTime = Date.now();

    downloadTimeout.current = setTimeout(() => {
      if (!alertShown) {
        setAlertShown(true);
        alert("Your internet is slow unable to run Editor now");
      }
      setIsDownloading(false);
    }, 10000);

    image.onload = () => {
      if (alertShown) return;
      const duration = (Date.now() - startTime) / 1000;
      const bitsLoaded = imageSizeBytes * 8;
      const speedMbps = (bitsLoaded / duration / 1024 / 1024).toFixed(2);
      clearTimeout(downloadTimeout.current);
      setDownloadSpeed(speedMbps);
      setIsDownloading(false);
    };

    image.onerror = () => {
      clearTimeout(downloadTimeout.current);
      setIsDownloading(false);
    };

    image.src = `https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg?${Date.now()}`;
  };

  // Upload speed test
  const measureUploadSpeed = () => {
    setIsUploading(true);
    const startTime = Date.now();
    const blob = new Blob([new Array(500000).join("a")], { type: "text/plain" });
    const xhr = new XMLHttpRequest();

    uploadTimeout.current = setTimeout(() => {
      if (!alertShown) {
        setAlertShown(true);
        alert("Your internet is slow unable to run Editor now");
      }
      setIsUploading(false);
    }, 10000);

    xhr.open("POST", "https://httpbin.org/post", true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && !alertShown) {
        const duration = (Date.now() - startTime) / 1000;
        const speedKbps = (e.loaded / duration / 1024).toFixed(2);
        setUploadSpeed((speedKbps / 1024).toFixed(2));
      }
    };

    xhr.onload = () => {
      if (!alertShown) {
        clearTimeout(uploadTimeout.current);
        setIsUploading(false);
      }
    };

    xhr.onerror = () => {
      clearTimeout(uploadTimeout.current);
      setIsUploading(false);
    };

    xhr.send(blob);
  };

  // Start test automatically after 3s
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setAlertShown(false);
      measureDownloadSpeed();
      measureUploadSpeed();
    }, 1000);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(downloadTimeout.current);
      clearTimeout(uploadTimeout.current);
    };
  }, []);

  // Speed-based alert after both tests complete
  useEffect(() => {
    if (
      downloadSpeed !== null &&
      uploadSpeed !== null &&
      !isDownloading &&
      !isUploading &&
      !alertShown
    ) {
      const d = parseFloat(downloadSpeed);
      const u = parseFloat(uploadSpeed);
  
      // ✅ Log first
      console.log(`Internet speed: Download: ${d} Mbps | Upload: ${u} Mbps`);
  
      if (d < 0.25 || u < 0.25) {
        setAlertShown(true);
        alert("Your internet is slow unable to run Editor now");
      }
    }
  }, [downloadSpeed, uploadSpeed, isDownloading, isUploading, alertShown]);
  
  return <Spinner />;
};

export default SpeedTest;
