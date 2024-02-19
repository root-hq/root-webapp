import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/create-market`);
  }, [router]);

  return (
    <div className={styles.appContainer}>
      <main>
        <span>Redirecting...</span>
      </main>
    </div>
  );
}
