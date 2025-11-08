# Fix all lint errors at once

# AdminReservas
(Get-Content "src/components/Admin/AdminReservas/AdminReservas.jsx") `
  -replace "import \{ collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where \} from 'firebase/firestore';", "import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';" `
  -replace "import \{ Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip \} from '@mui/material';", "import { Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';" |
  Set-Content "src/components/Admin/AdminReservas/AdminReservas.jsx"

# Fix useEffect in AdminReservas
$content = Get-Content "src/components/Admin/AdminReservas/AdminReservas.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*carregarReservas\(\);\s*\}, \[\]\);", "useEffect(() => { carregarReservas(); }, [carregarReservas]);"
$content | Set-Content "src/components/Admin/AdminReservas/AdminReservas.jsx"

# BlogAdmin
$content = Get-Content "src/components/Admin/BlogAdmin/BlogAdmin.jsx" -Raw
$content = $content -replace "import \{[^}]*getAllCategories[^}]*getAllTags[^}]*\} from", "import { createPost, updatePost, deletePost, getPostsByStatus } from"
$content | Set-Content "src/components/Admin/BlogAdmin/BlogAdmin.jsx"

# EditHeader
$content = Get-Content "src/components/Admin/EditHeader/EditHeader.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*fetchHeaderData\(\);\s*\}, \[\]\);", "useEffect(() => { fetchHeaderData(); }, [fetchHeaderData]);"
$content | Set-Content "src/components/Admin/EditHeader/EditHeader.jsx"

# AdminPacotes
(Get-Content "src/components/AdminPacotes/AdminPacotes.jsx") `
  -replace "import \{ TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress, Divider \} from '@mui/material';", "import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress } from '@mui/material';" |
  Set-Content "src/components/AdminPacotes/AdminPacotes.jsx"

# Footer
$content = Get-Content "src/components/Footer/Footer.jsx" -Raw
$content = $content -replace "FaMapMarkerAlt,\s*", ""
$content = $content -replace "FaPhone,\s*", ""
$content = $content -replace "FaEnvelope,\s*", ""
$content = $content -replace "FaClock,\s*", ""
$content = $content -replace "FaLinkedinIn,\s*", ""
$content = $content -replace "FaPinterestP,\s*", ""
$content = $content -replace "const \{ FiClockIcon \} = ", "// const { FiClockIcon } = "
$content | Set-Content "src/components/Footer/Footer.jsx"

# Header
$content = Get-Content "src/components/Header/Header.jsx" -Raw
$content = $content -replace "const handleWhatsAppClick = [^;]+;", "// Removed unused handleWhatsAppClick"
$content | Set-Content "src/components/Header/Header.jsx"

# PacotesCarousel
$content = Get-Content "src/components/PacotesCarousel/PacotesCarousel.jsx" -Raw
$content = $content -replace "const \[currentIndex, setCurrentIndex, scrollLeft\]", "const [currentIndex, setCurrentIndex]"
$content = $content -replace "const handleMouseLeave = [^;]+;", "// Removed unused handleMouseLeave"
$content = $content -replace "const handleTouchStart = [^;]+;", "// Removed unused handleTouchStart"
$content = $content -replace "const handleTouchEnd = [^;]+;", "// Removed unused handleTouchEnd"
$content | Set-Content "src/components/PacotesCarousel/PacotesCarousel.jsx"

# useWhatsAppNumber
$content = Get-Content "src/hooks/useWhatsAppNumber.js" -Raw
$content = $content -replace "\[whatsappNumber, setWhatsappNumber, setError\]", "[whatsappNumber, setWhatsappNumber]"
$content | Set-Content "src/hooks/useWhatsAppNumber.js"

# AvaliacoesPage
(Get-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx") `
  -replace "import \{[^}]*Chip[^}]*\} from '@mui/material';", "import { Card, CardContent, Avatar, Typography, Box, CircularProgress, Container, Divider, Rating } from '@mui/material';" `
  -replace "useEffect\(\(\) => \{\s*loadAvaliacoes\(\);\s*\}, \[\]\);", "useEffect(() => { loadAvaliacoes(); }, [loadAvaliacoes]);" |
  Set-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx"

# BlogPostPage
$content = Get-Content "src/pages/BlogPostPage/BlogPostPage.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*loadPost\(\);\s*\}, \[id\]\);", "useEffect(() => { loadPost(); }, [id, loadPost]);"
$content | Set-Content "src/pages/BlogPostPage/BlogPostPage.jsx"

# CategoriaPage
(Get-Content "src/pages/CategoriaPage/CategoriaPage.jsx") `
  -replace "import \{ collection, getDocs, query, orderBy, where \} from 'firebase/firestore';", "import { collection, getDocs, query, orderBy } from 'firebase/firestore';" `
  -replace "import \{ FiMapPin, FiClock, FiUsers, FiStar, FiCalendar, FiArrowRight \} from 'react-icons/fi';", "import { FiMapPin, FiClock, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';" |
  Set-Content "src/pages/CategoriaPage/CategoriaPage.jsx"

# PacoteDetailPage
$content = Get-Content "src/pages/PacoteDetailPage/PacoteDetailPage.jsx" -Raw
$content = $content -replace "const handleAccordionChange = [^;]+;", "// Removed unused handleAccordionChange"
$content | Set-Content "src/pages/PacoteDetailPage/PacoteDetailPage.jsx"

# PacotesListPage
(Get-Content "src/pages/PacotesListPage/PacotesListPage.jsx") `
  -replace "import \{ FiMapPin, FiClock, FiUsers, FiStar, FiCalendar, FiTrendingUp, FiArrowRight \} from 'react-icons/fi';", "import { FiMapPin, FiClock, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';" |
  Set-Content "src/pages/PacotesListPage/PacotesListPage.jsx"

# TransferChegadaSaidaPage
$content = Get-Content "src/pages/TransferChegadaSaidaPage/TransferChegadaSaidaPage.jsx" -Raw
$content = $content -replace "const \[veiculosDisponiveis, setVeiculosDisponiveis\]", "const [, setVeiculosDisponiveis]"
$content | Set-Content "src/pages/TransferChegadaSaidaPage/TransferChegadaSaidaPage.jsx"

# analyticsService
$content = Get-Content "src/services/analyticsService.js" -Raw
$content = $content -replace "import \{[^}]*limit[^}]*\} from 'firebase/firestore';", "import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';"
$content = $content -replace "export default \{", "const analyticsService = {"
$content = $content -replace "\};$", "}; export default analyticsService;"
$content | Set-Content "src/services/analyticsService.js"

# reservasService
(Get-Content "src/services/reservasService.js") `
  -replace "import \{ TipoReserva \} from '../models/reserva.model';", "// import { TipoReserva } from '../models/reserva.model';" |
  Set-Content "src/services/reservasService.js"

Write-Host "✅ Todas as correções foram aplicadas!" -ForegroundColor Green
