$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$csrf = Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/csrf' -Method Get -WebSession $session
$csrfToken = ($csrf.Content | ConvertFrom-Json).csrfToken
$form = "email=admin%40sanduta.art&password=admin123&csrfToken=$csrfToken&callbackUrl=http%3A%2F%2Flocalhost%3A3001%2Fadmin&json=true"
$login = Invoke-WebRequest -Uri 'http://localhost:3001/api/auth/callback/credentials' -Method Post -Body $form -WebSession $session -Headers @{ 'Content-Type' = 'application/x-www-form-urlencoded'; 'X-Requested-With' = 'XMLHttpRequest'; 'Referer' = 'http://localhost:3001/login' }
Write-Host "LOGIN_STATUS:$($login.StatusCode)"
$machines = Invoke-WebRequest -Uri 'http://localhost:3001/api/admin/machines' -Method Get -WebSession $session
Write-Host "MACHINES_STATUS:$($machines.StatusCode)"
Write-Host "MACHINES_PREFIX:$($machines.Content.Substring(0, 220))"
$page = Invoke-WebRequest -Uri 'http://localhost:3001/admin/machines' -Method Get -WebSession $session
Write-Host "PAGE_STATUS:$($page.StatusCode)"
Write-Host "PAGE_PREFIX:$($page.Content.Substring(0, 180))"
