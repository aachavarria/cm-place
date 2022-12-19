import styles from './page.module.css'
import Canvas from "../components/canvas/canvas";

export default function Home() {
    return (
        <main className={styles.main}>
            <Canvas/>
        </main>
    )
}
