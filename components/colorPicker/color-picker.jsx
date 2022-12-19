"use client"
import { useState } from "react";
import styles from './color-picker.module.scss'

const ColorPicker = (props) => {
    const [state, updateState] = useState("#FFFFFF");
    const handleInput = (e) => {
        updateState(e.target.value);
        props.onColorSelected?.(e.target.value);
    };
    return (
        <span className={styles.picker}>
            <input type="color" onChange={handleInput} value={state}/>
            <input type="text" onChange={handleInput} value={state}/>
        </span>
    );
}

export default ColorPicker