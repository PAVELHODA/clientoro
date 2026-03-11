# IMPORT SUPABASE DATABASE (PROJECT EDI)

$Psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$ConnB = "postgresql://postgres:[YOUR-PASSWORD]@db.yyaaoxgnqoqrpqwrglze.supabase.co:5432/postgres"
$In    = "C:\PROJECTS\rezervacni_system_copi\full_backup.sql"

& "$Psql" "$ConnB" < "$In"

Write-Host "Import hotov."
