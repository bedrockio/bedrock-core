import PropTypes from 'prop-types';
import qr from 'qr.js';
import React from 'react';

export default class QRCode extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.setCanvasRef = (element) => {
      this.canvas = element;
    };
  }

  componentDidMount() {
    this.updateCanvas();
  }

  updateCanvas() {
    const ctx = this.canvas.getContext('2d');
    const qrcode = qr(this.props.data);
    const cells = qrcode.modules;

    const tileW = this.props.width / cells.length;
    const tileH = this.props.height / cells.length;

    for (let r = 0; r < cells.length; r++) {
      const row = cells[r];
      for (let c = 0; c < row.length; ++c) {
        ctx.fillStyle = row[c] ? this.props.color : '#fff';
        const w = Math.ceil((c + 1) * tileW) - Math.floor(c * tileW);
        const h = Math.ceil((r + 1) * tileH) - Math.floor(r * tileH);
        ctx.fillRect(Math.round(c * tileW), Math.round(r * tileH), w, h);
      }
    }
  }

  render() {
    const { width, height, style } = this.props;
    return (
      <canvas
        style={style}
        width={width}
        height={height}
        ref={this.setCanvasRef}
      />
    );
  }
}

QRCode.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  color: PropTypes.string,
};

QRCode.defaultProps = {
  height: 200,
  width: 200,
  color: '#000',
};
