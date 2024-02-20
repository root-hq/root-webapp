import React, { useEffect, useState } from "react";
import styles from "./Announcement.module.css";
import Link from "next/link";

const Announcement = () => {

    const [showAnnouncement, setShowAnnouncement] = useState(true);

    useEffect(() => {
        const hasClosedAnnouncement = localStorage.getItem('closedAnnouncement');
        if (hasClosedAnnouncement) {
          setShowAnnouncement(false);
        }
      }, []);
    
      const handleClose = () => {
        setShowAnnouncement(false);
        localStorage.setItem('new:jlpusdc', 'true');
      };
    

    return (
        <div className={styles.announcementContainer}>
            {
                showAnnouncement ?
                    <div className={styles.announcementInnerContainer}>
                        <span></span>
                        <span className={styles.announcement}><Link className={styles.link} href="/yoyo">{`JLP - USDC`}</Link> is live</span>
                        <span className={styles.closeButton} onClick={() => handleClose()}><i className="fa-solid fa-xmark"></i></span>
                    </div>
                :
                    <></>
            }
        </div>
    )
}

export default Announcement;