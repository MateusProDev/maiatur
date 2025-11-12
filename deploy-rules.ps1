Write-Host "🚀 Fazendo deploy das regras do Firestore..." -ForegroundColor Green
firebase deploy --only firestore:rules
Write-Host ""
Write-Host "✅ Deploy concluído! Pressione qualquer tecla para fechar..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
