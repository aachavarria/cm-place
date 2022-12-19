"use client"
import { useEffect, useRef } from "react";
import ColorPicker from "../colorPicker/color-picker";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

const TB_API_URL = "https://api.us-east.tinybird.co";
const TB_TOKEN = 'p.eyJ1IjogIjQ4OThmNjcxLTMyY2MtNDU2ZS04MzI3LWNkYTA5MGVhNWRhNSIsICJpZCI6ICJjMDUyZjY5Mi0yYmE0LTQ5NDUtYmU2NC0xYzk2OWYwYTZkNzAifQ.1B5HP4xOBeRoXPhUOhNo2c1iEnHr4XekvXi7K8TxkZ4';

const Canvas = () => {
  const ref = useRef({ color: '#FFFFFF' })
  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    let pixels = [];
    let isPressed = false;

    const draw = ({ x, y, color }) => {
      ctx.beginPath()
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
      ctx.fill();
    }

    const printSnapshot = (startDate) => {
      const param = startDate ? `?start_date=${startDate}` : '';
      fetch(`${TB_API_URL}/v0/pipes/get_snapshot.json${param}`, {
        method: 'GET',
        headers: new Headers(({
          Authorization: `Bearer ${TB_TOKEN}`,
          Accept: 'application/json',
          "Content-Type": 'application/json'
        }))
      }).then((r) => r.json())
        .then(({ data }) => {
          data.forEach(function (item) {
            draw(item);
          })
        })
    }

    const ingestPixels = function (pixels) {
      const ndjson = pixels
        .map((item) => ({ ...item, date: Date.now() }))
        .reduce(
          (prev, current) =>
            `${prev}
${JSON.stringify(current)}`,
          ""
        );

      fetch(`${TB_API_URL}/v0/events?name=pixels_table`, {
        method: "POST",
        headers: new Headers({
          Authorization: `Bearer ${TB_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
        body: ndjson,
      });
    };

    const getPixelClicked = function (canvas, e) {
      let rect = canvas.getBoundingClientRect();

      return {
            x: Math.floor(e.clientX - rect.left),
            y: Math.floor(e.clientY - rect.top),
            color: ref.current.color
      };
    };

    const onUseBrush = function (event) {
      if (isPressed) {
        const pixel = getPixelClicked(canvas, event);
        if (!pixels.find((item) => pixel.x === item.x && pixel.y === item.y)) {
          pixels.push(pixel);
        }
        draw(pixel);
      }
    };

    const onPressBrush = function (event) {
      isPressed = true;
      onUseBrush(event);
    };

    const onRaiseBrush = function () {
      isPressed = false;
      ingestPixels(pixels);
      pixels = [];
    };


    canvas.onmousedown = onPressBrush

    canvas.onmousemove = onUseBrush

    canvas.onmouseup = onRaiseBrush

    printSnapshot();

    setInterval(() => {
      const t = new Date();
      t.setSeconds(t.getSeconds() - 10);
      printSnapshot(t.toISOString().slice(0, 19).replace('T', ' '));
    }, 3000)

  }, [])

  return (
    <>
      <ColorPicker onColorSelected={(color) => {
        ref.current.color = color
      }}/>
      <canvas id="canvas" style={{ border: '1px solid red' }}/>
    </>

  )
}

export default Canvas;