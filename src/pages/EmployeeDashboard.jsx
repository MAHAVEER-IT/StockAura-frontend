import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { getProductByBarcode } from '../services/api'

const formatDate = (value) => {
  if (!value) {
    return 'N/A'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('en-IN')
}

export default function EmployeeDashboard({ employeeEmail, authToken, onLogout }) {
  const [barcode, setBarcode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [scanError, setScanError] = useState('')
  const [product, setProduct] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [cameraStatus, setCameraStatus] = useState('')

  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const controlsRef = useRef(null)
  const lastScannedRef = useRef('')

  const handleLookup = async (event) => {
    event.preventDefault()
    const trimmedBarcode = barcode.trim()

    await lookupByBarcode(trimmedBarcode)
  }

  const lookupByBarcode = async (rawBarcode) => {
    const trimmedBarcode = rawBarcode.trim()

    if (!trimmedBarcode) {
      setScanError('Please scan or enter a barcode.')
      return false
    }

    setIsSearching(true)
    setScanError('')

    try {
      const response = await getProductByBarcode(authToken, trimmedBarcode)
      setProduct(response.product || null)
      return true
    } catch (error) {
      setProduct(null)
      setScanError(error.message)
      return false
    } finally {
      setIsSearching(false)
    }
  }

  const stopCamera = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setIsCameraOpen(false)
    setCameraStatus('')
  }

  const startCamera = async () => {
    setCameraError('')
    setScanError('')
    lastScannedRef.current = ''
    setCameraStatus('Starting camera...')

    try {
      if (!readerRef.current) {
        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128])
        readerRef.current = new BrowserMultiFormatReader(hints)
      }

      const controls = await readerRef.current.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        videoRef.current,
        async (result, error) => {
          if (result) {
            const scannedText = result.getText().trim()
            if (!scannedText || scannedText === lastScannedRef.current) {
              return
            }

            lastScannedRef.current = scannedText
            setBarcode(scannedText)
            setCameraStatus('Barcode detected. Fetching product...')
            stopCamera()
            await lookupByBarcode(scannedText)
          }

          if (error && error.name === 'NotAllowedError') {
            setCameraError('Camera permission denied. Please allow camera access.')
          }
        },
      )

      controlsRef.current = controls
      setIsCameraOpen(true)
      setCameraStatus('Camera active. Point barcode to the center area.')
    } catch (error) {
      setCameraError(error.message || 'Unable to start camera scanner.')
      stopCamera()
    }
  }

  const handleCameraToggle = async () => {
    if (isCameraOpen) {
      stopCamera()
      return
    }

    await startCamera()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="employee-shell">
      <header className="top-nav">
        <div className="brand-wrap">
          <div className="brand-orb" />
          <p className="brand-name">StockAura Employee</p>
        </div>
        <button className="ghost-btn" type="button" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="employee-main">
        <section className="employee-intro">
          <p className="hero-kicker">Employee Dashboard</p>
          <h1>Welcome, {employeeEmail}</h1>
          <p>Use barcode scan to quickly find product details.</p>
        </section>

        <section className="employee-feature-card" aria-label="Barcode scan feature">
          <div className="option-header">
            <h2>Barcode Scan</h2>
          </div>

          <form className="employee-scan-form" onSubmit={handleLookup}>
            <div className="field-group">
              <label htmlFor="employee-barcode">Barcode</label>
              <input
                id="employee-barcode"
                type="text"
                placeholder="Scan barcode and press Enter"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                autoFocus
              />
            </div>

            <div className="employee-camera-actions">
              <button className="secondary-btn" type="button" onClick={handleCameraToggle}>
                {isCameraOpen ? 'Stop Camera Scan' : 'Start Camera Scan'}
              </button>
            </div>

            <div className={`employee-camera-wrap ${isCameraOpen ? 'active' : ''}`}>
              <video ref={videoRef} className="employee-camera-video" muted playsInline />
            </div>

            <button className="primary-btn" type="submit" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Get Product'}
            </button>
          </form>

          {cameraError ? <p className="form-error">{cameraError}</p> : null}
          {cameraStatus ? <p className="file-note">{cameraStatus}</p> : null}
          {scanError ? <p className="form-error">{scanError}</p> : null}

          {product ? (
            <article className="employee-product-card" aria-label="Scanned product details">
              <div className="employee-product-head">
                <div>
                  <p className="employee-product-kicker">Scan Result</p>
                  <h3>{product.name}</h3>
                </div>
                <span className="employee-product-badge">Barcode: {product.barcode || 'N/A'}</span>
              </div>

              <div className="employee-product-body">
                <div className="employee-product-meta-grid">
                  <div className="employee-meta-tile">
                    <p>Category</p>
                    <h4>{product.category?.name || 'N/A'}</h4>
                  </div>
                  <div className="employee-meta-tile">
                    <p>Supplier</p>
                    <h4>{product.supplier?.name || 'N/A'}</h4>
                  </div>
                  <div className="employee-meta-tile">
                    <p>Price</p>
                    <h4>{product.price ?? 'N/A'}</h4>
                  </div>
                  <div className="employee-meta-tile">
                    <p>Stock</p>
                    <h4>{product.quantity ?? 'N/A'}</h4>
                  </div>
                  <div className="employee-meta-tile employee-meta-wide">
                    <p>Expiry Date</p>
                    <h4>{formatDate(product.expiryDate)}</h4>
                  </div>
                </div>

                {product.imageUrl ? (
                  <div className="employee-product-media">
                    <img className="employee-product-image" src={product.imageUrl} alt={product.name} />
                  </div>
                ) : null}
              </div>
            </article>
          ) : null}
        </section>
      </main>
    </div>
  )
}
