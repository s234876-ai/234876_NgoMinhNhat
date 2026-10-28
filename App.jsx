import { useCallback, useEffect, useState } from 'react'

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const blankBook = {
  title: '',
  author: '',
  category: '',
  publisher: '',
  publishYear: '',
  isbn: '',
  quantity: '',
  description: '',
}

async function request(path, options) {
  const response = await fetch(`${apiBase}${path}`, options)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || `Yêu cầu thất bại (${response.status}).`)
  return body
}

function App() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(blankBook)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadBooks = useCallback(async (query = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('search', query.trim())
      const result = await request(`/api/books${params.size ? `?${params}` : ''}`)
      setBooks(result)
    } catch (err) {
      setError(err.message)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => loadBooks(search), 250)
    return () => window.clearTimeout(timer)
  }, [loadBooks, search])

  function resetForm() {
    setForm(blankBook)
    setEditingId('')
  }

  function editBook(book) {
    setEditingId(book._id)
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher,
      publishYear: String(book.publishYear),
      isbn: book.isbn,
      quantity: String(book.quantity),
      description: book.description || '',
    })
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitBook(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload = {
      ...form,
      publishYear: Number(form.publishYear),
      quantity: Number(form.quantity),
    }
    try {
      await request(editingId ? `/api/books/${editingId}` : '/api/books', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice(editingId ? 'Đã cập nhật thông tin sách.' : 'Đã thêm sách vào thư viện.')
      resetForm()
      await loadBooks(search)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Xóa “${book.title}” khỏi thư viện?`)) return
    setError('')
    setNotice('')
    try {
      await request(`/api/books/${book._id}`, { method: 'DELETE' })
      setNotice('Đã xóa sách.')
      await loadBooks(search)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Thư viện sách">
          <span className="brand-mark">T</span>
          <span>thư viện<span className="brand-light">.mây</span></span>
        </a>
        <span className="student-tag">234876_NgoMinhNhat</span>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">GÓC ĐỌC CỦA BẠN</p>
          <h1>Mỗi cuốn sách,<br />một thế giới mới.</h1>
          <p className="hero-description">Quản lý và khám phá bộ sưu tập sách của bạn ở bất cứ đâu.</p>
          <a className="hero-link" href="#library">Khám phá thư viện <span aria-hidden="true">↓</span></a>
        </div>
        <div className="book-art" aria-hidden="true">
          <span className="art-sun" />
          <span className="art-book art-book-back" />
          <span className="art-book art-book-middle" />
          <span className="art-book art-book-front"><i>NHỮNG<br />TRANG<br />MỞ</i><b>01</b></span>
          <span className="art-sparkle">✳</span>
        </div>
      </section>

      <section className="workspace" id="library">
        <div className="section-heading">
          <div><p className="eyebrow">BỘ SƯU TẬP</p><h2>Thư viện của bạn</h2></div>
          <span className="book-count">{books.length} đầu sách</span>
        </div>

        {(error || notice) && (
          <div className={error ? 'message message-error' : 'message message-success'} role="status">
            {error || notice}
            {error && <button className="message-action" onClick={() => loadBooks(search)}>Thử lại</button>}
          </div>
        )}

        <div className="library-layout">
          <section className="book-panel">
            <div className="toolbar">
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Tìm tên sách, tác giả, thể loại..." value={search}
                  onChange={(event) => setSearch(event.target.value)} aria-label="Tìm kiếm sách" />
              </label>
              <button className="refresh-button" type="button" onClick={() => loadBooks(search)} aria-label="Tải lại danh sách">↻</button>
            </div>

            {loading ? (
              <div className="empty-state"><span className="loader" />Đang tải thư viện...</div>
            ) : books.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">▤</span>
                <strong>{search ? 'Không tìm thấy sách phù hợp' : 'Thư viện đang chờ cuốn sách đầu tiên'}</strong>
                <span>{search ? 'Thử từ khóa khác nhé.' : 'Dùng biểu mẫu bên cạnh để thêm sách mới.'}</span>
              </div>
            ) : (
              <div className="book-list">
                {books.map((book, index) => (
                  <article className="book-card" key={book._id}>
                    <div className={`book-cover cover-${index % 4}`} aria-hidden="true">
                      <span>{book.category}</span><b>{book.title.slice(0, 1).toUpperCase()}</b>
                    </div>
                    <div className="book-info">
                      <span className="category-label">{book.category}</span>
                      <h3>{book.title}</h3>
                      <p className="book-author">{book.author}</p>
                      <p className="book-meta">{book.publisher} · {book.publishYear}</p>
                      <div className="book-bottom"><span>ISBN {book.isbn}</span><span className="quantity">{book.quantity} cuốn</span></div>
                      {book.description && <p className="book-description">{book.description}</p>}
                    </div>
                    <div className="book-actions">
                      <button type="button" onClick={() => editBook(book)} aria-label={`Sửa ${book.title}`}>Sửa</button>
                      <button type="button" className="delete-action" onClick={() => deleteBook(book)} aria-label={`Xóa ${book.title}`}>Xóa</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="form-panel">
            <div className="form-heading">
              <span className="form-icon">＋</span>
              <div><p className="eyebrow">{editingId ? 'CHỈNH SỬA' : 'THÊM VÀO BỘ SƯU TẬP'}</p><h2>{editingId ? 'Cập nhật sách' : 'Thêm sách mới'}</h2></div>
            </div>
            <form onSubmit={submitBook}>
              <label>Tên sách<input required maxLength="200" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Nhà giả kim" /></label>
              <label>Tác giả<input required maxLength="120" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Tên tác giả" /></label>
              <div className="form-row">
                <label>Thể loại<input required maxLength="80" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Văn học" /></label>
                <label>Năm xuất bản<input required type="number" min="0" max="9999" value={form.publishYear} onChange={(e) => setForm({ ...form, publishYear: e.target.value })} placeholder="2024" /></label>
              </div>
              <label>Nhà xuất bản<input required maxLength="120" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="Tên nhà xuất bản" /></label>
              <div className="form-row">
                <label>Mã ISBN<input required maxLength="32" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978..." /></label>
                <label>Số lượng<input required type="number" min="0" step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="1" /></label>
              </div>
              <label>Mô tả <span className="optional">(không bắt buộc)</span><textarea maxLength="2000" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Đôi nét về cuốn sách..." /></label>
              <button className="submit-button" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm vào thư viện'} <span aria-hidden="true">↗</span></button>
              {editingId && <button className="cancel-button" type="button" onClick={resetForm}>Hủy chỉnh sửa</button>}
            </form>
          </aside>
        </div>
      </section>

      <footer className="footer"><span>THƯ VIỆN SÁCH ĐÁM MÂY</span><span>Đồ án Điện toán đám mây · 234876_NgoMinhNhat</span></footer>
    </main>
  )
}

export default App
