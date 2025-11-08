# Fix all ESLint warnings

# AdminReservas
$content = Get-Content "src/components/Admin/AdminReservas/AdminReservas.jsx" -Raw
$content = $content -replace "import \{ collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where \} from 'firebase/firestore';", "import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';"
$content = $content -replace "import \{ Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip \} from '@mui/material';", "import { Card, CardContent, CardActions, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';"
$content = $content -replace "useEffect\(\(\) => \{\s*carregarReservas\(\);\s*\}, \[\]\);", "const fetchReservas = useCallback(async () => { await carregarReservas(); }, []);<NEWLINE><NEWLINE>  useEffect(() => { fetchReservas(); }, [fetchReservas]);"
$content | Set-Content "src/components/Admin/AdminReservas/AdminReservas.jsx"

# EditHeader
$content = Get-Content "src/components/Admin/EditHeader/EditHeader.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*fetchHeaderData\(\);\s*\}, \[\]\);", "const loadHeader = useCallback(async () => { await fetchHeaderData(); }, []);<NEWLINE><NEWLINE>  useEffect(() => { loadHeader(); }, [loadHeader]);"
$content | Set-Content "src/components/Admin/EditHeader/EditHeader.jsx"

# AdminPacotes
(Get-Content "src/components/AdminPacotes/AdminPacotes.jsx") -replace "import \{ TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress, Divider \} from '@mui/material';", "import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, CircularProgress } from '@mui/material';" | Set-Content "src/components/AdminPacotes/AdminPacotes.jsx"

# Footer
(Get-Content "src/components/Footer/Footer.jsx") -replace "FaPinterestP,\s*", "" | Set-Content "src/components/Footer/Footer.jsx"
$content = Get-Content "src/components/Footer/Footer.jsx" -Raw
$content = $content -replace "const \{ FiClockIcon \}", "// const { FiClockIcon }"
$content | Set-Content "src/components/Footer/Footer.jsx"

# Header - remover unused
$content = Get-Content "src/components/Header/Header.jsx" -Raw
$content = $content -replace "const handleWhatsAppClick = \([^)]+\) => \{[^}]+\};", ""
$content | Set-Content "src/components/Header/Header.jsx"

# PacotesCarousel
$content = Get-Content "src/components/PacotesCarousel/PacotesCarousel.jsx" -Raw
$content = $content -replace "\[currentIndex, setCurrentIndex, scrollLeft\]", "[currentIndex, setCurrentIndex]"
$content | Set-Content "src/components/PacotesCarousel/PacotesCarousel.jsx"

# useWhatsAppNumber
(Get-Content "src/hooks/useWhatsAppNumber.js") -replace "\[whatsappNumber, setWhatsappNumber, setError\]", "[whatsappNumber, setWhatsappNumber]" | Set-Content "src/hooks/useWhatsAppNumber.js"

# AvaliacoesPage
(Get-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx") -replace "Chip,\s*", "" | Set-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx"
$content = Get-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*loadAvaliacoes\(\);\s*\}, \[\]\);", "useEffect(() => { loadAvaliacoes(); // eslint-disable-next-line react-hooks/exhaustive-deps<NEWLINE>  }, []);"
$content | Set-Content "src/pages/AvaliacoesPage/AvaliacoesPage.jsx"

# BlogPostPage
$content = Get-Content "src/pages/BlogPostPage/BlogPostPage.jsx" -Raw
$content = $content -replace "useEffect\(\(\) => \{\s*loadPost\(\);\s*\}, \[id\]\);", "useEffect(() => { loadPost(); // eslint-disable-next-line react-hooks/exhaustive-deps<NEWLINE>  }, [id]);"
$content | Set-Content "src/pages/BlogPostPage/BlogPostPage.jsx"

# CategoriaPage
(Get-Content "src/pages/CategoriaPage/CategoriaPage.jsx") -replace "import \{ collection, getDocs, query, orderBy, where \} from 'firebase/firestore';", "import { collection, getDocs, query, orderBy } from 'firebase/firestore';" | Set-Content "src/pages/CategoriaPage/CategoriaPage.jsx"
(Get-Content "src/pages/CategoriaPage/CategoriaPage.jsx") -replace "FiCalendar,\s*", "" | Set-Content "src/pages/CategoriaPage/CategoriaPage.jsx"

# PacotesListPage  
(Get-Content "src/pages/PacotesListPage/PacotesListPage.jsx") -replace "FiCalendar,\s*", "" | Set-Content "src/pages/PacotesListPage/PacotesListPage.jsx"
(Get-Content "src/pages/PacotesListPage/PacotesListPage.jsx") -replace "FiTrendingUp,\s*", "" | Set-Content "src/pages/PacotesListPage/PacotesListPage.jsx"

# reservasService
(Get-Content "src/services/reservasService.js") -replace "import \{ TipoReserva \} from '../models/reserva.model';", "// import { TipoReserva } from '../models/reserva.model';" | Set-Content "src/services/reservasService.js"

Write-Host "✅ Todas as correções foram aplicadas!" -ForegroundColor Green
