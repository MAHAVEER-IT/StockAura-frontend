import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import ProductList from '../components/admin/ProductList'
import InventoryLogList from '../components/admin/InventoryLogList'
import LowStockAlerts from '../components/admin/LowStockAlerts'
import ExpiryAlerts from '../components/employee/ExpiryAlerts'
import {
  getProducts,
  getInventoryLogs,
  getLowStockProducts,
  updateStock,
  getProductByBarcode,
} from '../services/api'

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-IN')
}

export default function EmployeeDashboard({ userEmail, employeeEmail, authToken, onLogout }) {
  const displayEmail = userEmail || employeeEmail

  // Inventory state
  const [products, setProducts] = useState([])
  const [inventoryLogs, setInventoryLogs] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Barcode scanner state
  const [barcode, setBarcode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scannedProduct, setScannedProduct] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [cameraStatus, setCameraStatus] = useState('')

  const [showBarcodePanel, setShowBarcodePanel] = useState(false)
  const [showProductPanel, setShowProductPanel] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)

  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const controlsRef = useRef(null)
  const streamRef = useRef(null)
  const nativeScanTimerRef = useRef(null)
  const lastScannedRef = useRef('')

  const mapProduct = (product) => ({
    id: product._id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    barcode: product.barcode,
    quantity: product.quantity || 0,
    lowStockThreshold: product.lowStockThreshold || 20,
    expiryDate: product.expiryDate || '',
    expiry: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-IN') : '',
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category?.name || 'Uncategorized',
    supplier: product.supplier?.name || 'Unknown',
  })

  const loadData = async () => {
    if (!authToken) return
    try {
      setLoading(true)
      const [productsRes, logsRes, lowStockRes] = await Promise.all([
        getProducts(authToken),
        getInventoryLogs(authToken),
        getLowStockProducts(authToken),
      ])
      setProducts((productsRes.products || []).map(mapProduct))
      setInventoryLogs(logsRes.logs || [])
      setLowStockProducts((lowStockRes.products || []).map(mapProduct))
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStock = async (productId, payload) => {
    try {
      await updateStock(authToken, productId, payload)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  // Barcode lookup
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
      setScannedProduct(response.product || null)
      return true
    } catch (err) {
      setScannedProduct(null)
      setScanError(err.message)
      return false
    } finally {
      setIsSearching(false)
    }
  }

  const handleLookup = async (event) => {
    event.preventDefault()
    await lookupByBarcode(barcode)
  }

  // Camera controls
  const stopCamera = () => {
    controlsRef.current?.stop()
    controlsRef.current = null

    if (nativeScanTimerRef.current) {
      window.clearInterval(nativeScanTimerRef.current)
      nativeScanTimerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsCameraOpen(false)
    setCameraStatus('')
  }

  const handleDetectedBarcode = async (rawValue) => {
    const scannedText = String(rawValue || '').trim()
    if (!scannedText || scannedText === lastScannedRef.current) return

    lastScannedRef.current = scannedText
    setBarcode(scannedText)
    setCameraStatus('Barcode detected. Fetching product...')
    stopCamera()
    await lookupByBarcode(scannedText)
  }

  const startNativeBarcodeScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      return false
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['code_128'] })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setIsCameraOpen(true)
      setCameraStatus('Camera active. Scanning with native detector...')

      nativeScanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          return
        }

        try {
          const codes = await detector.detect(videoRef.current)
          if (codes?.length) {
            const value = codes[0]?.rawValue
            if (value) {
              await handleDetectedBarcode(value)
            }
          }
        } catch {
          // Ignore frame-level detector errors and continue scanning.
        }
      }, 90)

      return true
    } catch {
      stopCamera()
      return false
    }
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
        async (result, err) => {
          if (result) {
            await handleDetectedBarcode(result.getText())
          }
          if (err && err.name === 'NotAllowedError') {
            setCameraError('Camera permission denied. Please allow camera access.')
          }
        },
      )
      controlsRef.current = controls
      setIsCameraOpen(true)
      setCameraStatus('Camera active. Point barcode to the center area (fallback scanner).')
    } catch (err) {
      setCameraError(err.message || 'Unable to start camera scanner.')
      stopCamera()
    }
  }

  const handleCameraToggle = async () => {
    if (isCameraOpen) {
      stopCamera()
      return
    }

    const nativeStarted = await startNativeBarcodeScanner()
    if (!nativeStarted) {
      await startCamera()
    }
  }

  const handleToggleBarcodePanel = () => {
    setShowBarcodePanel((prev) => {
      if (prev && isCameraOpen) {
        stopCamera()
      }
      return !prev
    })
  }

  useEffect(() => {
    loadData()
    return () => {
      stopCamera()
    }
  }, [authToken])

  if (loading) {
    return (
      <div className="dashboard-shell">
        <div className="loading-state">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-shell employee-dashboard">
      <header className="top-nav">
        <div className="brand-wrap">
          <div className="brand-orb employee-orb" />
          <p className="brand-name">StockAura Employee</p>
        </div>
        <div className="user-info">
          <span>👤 {displayEmail}</span>
          <button className="ghost-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-intro">
          <p className="hero-kicker">Employee Dashboard</p>
          <h1>Welcome, {displayEmail}</h1>
          <p>Monitor stock levels, update quantities, scan barcodes, and track inventory movements.</p>
          {error && <p className="dashboard-error">{error}</p>}
        </section>

        {/* Low Stock Alerts */}
        <section className="dashboard-grid employee-panel-grid">
          <article className="option-card" aria-label="Low stock alerts">
            <div className="option-header">
              <h2>Low Stock Alerts</h2>
            </div>
            <div className="option-content" aria-hidden="false">
              <LowStockAlerts products={lowStockProducts} />
            </div>
          </article>
        </section>

        {/* Expiry Alerts */}
        <section className="dashboard-grid employee-panel-grid">
          <article className="option-card" aria-label="Expiry alerts">
            <div className="option-header">
              <h2>Expiry Alerts</h2>
            </div>
            <div className="option-content" aria-hidden="false">
              <ExpiryAlerts products={products} days={7} />
            </div>
          </article>
        </section>

        {/* Barcode Scanner */}
        <section className="dashboard-grid employee-scan-grid">
          <article className="option-card employee-scan-card" aria-label="Barcode scan feature">
            <div className="option-header">
              <h2>🔍 Barcode Scan</h2>
              <button className="option-toggle" type="button" onClick={handleToggleBarcodePanel}>
                {showBarcodePanel ? 'Close' : 'Expand'}
              </button>
            </div>

            <div
              className={`option-content panel-body ${
                showBarcodePanel ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showBarcodePanel}
            >
              <div className="scan-hero">
                <div>
                  <p className="scan-kicker">Quick Lookup</p>
                  <h3>Scan with camera or enter barcode manually</h3>
                  <p>Use camera for instant fetch, or type a code and search.</p>
                </div>
                <div className="scan-chip-row" aria-label="Supported scan information">
                  <span className="scan-chip">Code 128</span>
                  <span className="scan-chip">Auto-stop</span>
                  <span className="scan-chip">Fast mode</span>
                </div>
              </div>

              <form className="employee-scan-form" onSubmit={handleLookup}>
                <div className="field-group employee-barcode-field">
                  <label htmlFor="employee-barcode">Barcode</label>
                  <input
                    id="employee-barcode"
                    type="text"
                    placeholder="Scan barcode and press Enter"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="employee-camera-actions">
                  <button className="secondary-btn" type="button" onClick={handleCameraToggle}>
                    {isCameraOpen ? 'Stop Camera Scan' : 'Start Camera Scan'}
                  </button>
                  <button className="primary-btn" type="submit" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Get Product'}
                  </button>
                </div>

                <div className={`employee-camera-wrap ${isCameraOpen ? 'active' : ''}`}>
                  <video ref={videoRef} className="employee-camera-video" muted playsInline />
                  <div className="employee-camera-overlay" aria-hidden="true">
                    <div className="employee-scan-target" />
                    <span className="employee-overlay-note">Align barcode inside frame</span>
                  </div>
                </div>
              </form>

              <div className="scan-feedback-stack" aria-live="polite">
                {cameraError ? <p className="form-error">{cameraError}</p> : null}
                {cameraStatus ? (
                  <p className={`scan-status-pill ${isCameraOpen ? 'is-live' : ''}`}>{cameraStatus}</p>
                ) : null}
                {scanError ? <p className="form-error">{scanError}</p> : null}
              </div>

              {scannedProduct ? (
                <article className="employee-product-card" aria-label="Scanned product details">
                  <div className="employee-product-head">
                    <div>
                      <p className="employee-product-kicker">Scan Result</p>
                      <h3>{scannedProduct.name}</h3>
                    </div>
                    <span className="employee-product-badge">
                      Barcode: {scannedProduct.barcode || 'N/A'}
                    </span>
                  </div>

                  <div className="employee-product-body">
                    <div className="employee-product-meta-grid">
                      <div className="employee-meta-tile">
                        <p>Category</p>
                        <h4>{scannedProduct.category?.name || 'N/A'}</h4>
                      </div>
                      <div className="employee-meta-tile">
                        <p>Supplier</p>
                        <h4>{scannedProduct.supplier?.name || 'N/A'}</h4>
                      </div>
                      <div className="employee-meta-tile">
                        <p>Price</p>
                        <h4>{scannedProduct.price ?? 'N/A'}</h4>
                      </div>
                      <div className="employee-meta-tile">
                        <p>Stock</p>
                        <h4>{scannedProduct.quantity ?? 'N/A'}</h4>
                      </div>
                      <div className="employee-meta-tile employee-meta-wide">
                        <p>Expiry Date</p>
                        <h4>{formatDate(scannedProduct.expiryDate)}</h4>
                      </div>
                    </div>

                    {scannedProduct.imageUrl ? (
                      <div className="employee-product-media">
                        <img
                          className="employee-product-image"
                          src={scannedProduct.imageUrl}
                          alt={scannedProduct.name}
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}
            </div>
            <p className={`option-collapsed-note ${showBarcodePanel ? 'note-hidden' : ''}`}>
              Panel collapsed. Click Expand to open.
            </p>
          </article>
        </section>

        {/* Product Inventory */}
        <section className="dashboard-grid product-grid">
          <article className="option-card full-width">
            <div className="option-header">
              <h2>📦 Product Inventory</h2>
              <span className="badge">Sort & Filter</span>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowProductPanel((prev) => !prev)}
              >
                {showProductPanel ? 'Close' : 'Expand'}
              </button>
            </div>
            <div
              className={`option-content panel-body ${
                showProductPanel ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showProductPanel}
            >
              <ProductList
                products={products}
                onUpdateStock={handleUpdateStock}
                employeeMode={true}
              />
            </div>
            <p className={`option-collapsed-note ${showProductPanel ? 'note-hidden' : ''}`}>
              Panel collapsed. Click Expand to open.
            </p>
          </article>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-grid employee-log-grid">
          <article className="option-card">
            <div className="option-header">
              <h2>📊 Recent Activity</h2>
              <button
                className="option-toggle"
                type="button"
                onClick={() => setShowActivityPanel((prev) => !prev)}
              >
                {showActivityPanel ? 'Close' : 'Expand'}
              </button>
            </div>
            <div
              className={`option-content panel-body ${
                showActivityPanel ? 'panel-expanded' : 'panel-collapsed'
              }`}
              aria-hidden={!showActivityPanel}
            >
              <InventoryLogList logs={inventoryLogs} />
            </div>
            <p className={`option-collapsed-note ${showActivityPanel ? 'note-hidden' : ''}`}>
              Panel collapsed. Click Expand to open.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}