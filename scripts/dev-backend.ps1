$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$bundlePath = Join-Path $projectRoot 'node-windows-ca.pem'
$certificates = foreach ($location in @('LocalMachine', 'CurrentUser')) {
  $store = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root', $location)
  try {
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadOnly)
    $store.Certificates
  } finally { $store.Close() }
}
$pem = ($certificates | Sort-Object Thumbprint -Unique | ForEach-Object {
  "-----BEGIN CERTIFICATE-----`n" +
    [Convert]::ToBase64String($_.RawData, [Base64FormattingOptions]::InsertLineBreaks) +
    "`n-----END CERTIFICATE-----"
}) -join "`n"
[IO.File]::WriteAllText($bundlePath, $pem)
$previousCertificates = $env:NODE_EXTRA_CA_CERTS
try {
  $env:NODE_EXTRA_CA_CERTS = $bundlePath
  Push-Location (Join-Path (Split-Path $projectRoot -Parent) 'my-strapi')
  try { npm run develop } finally { Pop-Location }
} finally {
  $env:NODE_EXTRA_CA_CERTS = $previousCertificates
}
