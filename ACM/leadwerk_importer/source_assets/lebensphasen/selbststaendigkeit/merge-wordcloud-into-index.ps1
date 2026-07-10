$ErrorActionPreference = 'Stop'
$base = $PSScriptRoot
$frag = Join-Path $base 'wordcloud-inline.fragment.html'
$idxPath = Join-Path $base 'index.html'
$enc = [System.Text.UTF8Encoding]::new($false)
$fragText = [System.IO.File]::ReadAllText($frag, $enc)
$idx = [System.IO.File]::ReadAllText($idxPath, $enc)
$needle = '<svg id="sst-wordcloud-svg"'
$s = $idx.IndexOf($needle, [System.StringComparison]::Ordinal)
if ($s -lt 0) { throw 'index.html: <svg id="sst-wordcloud-svg" nicht gefunden' }
$e = $idx.IndexOf('</svg>', $s, [System.StringComparison]::Ordinal)
if ($e -lt 0) { throw 'index.html: closing </svg> for wordcloud not found' }
$e = $e + 6
$new = $idx.Substring(0, $s) + $fragText + $idx.Substring($e)
[System.IO.File]::WriteAllText($idxPath, $new, $enc)
Write-Host 'Merged wordcloud into index.html'
