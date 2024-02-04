import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Default address value
    const defaultAddress = "4DoNfFBfF7UokCC2FQzriy7yHK6DY6NVdYpuekQ5pRgg";

    // Redirect to the /market/[address] route with the default address
    router.replace(`/market/${defaultAddress}`);
  }, [router]);

  return (
    <div className={styles.appContainer}>
      <main>
        <span>Redirecting...</span>
      </main>
    </div>
  );
}