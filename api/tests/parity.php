<?php
// Proves the PHP engine matches the TypeScript engine on 500 random selections.
declare(strict_types=1);
require __DIR__ . '/../lib/engine.php';
$book = json_decode((string) file_get_contents(__DIR__ . '/../data/pricebook.json'), true);
$cases = json_decode((string) file_get_contents(__DIR__ . '/parity-fixtures.json'), true);
$fail = 0;
foreach ($cases as $i => $c) {
    $sel = $c['sel'];
    $sel['addons'] = (array) $sel['addons'];
    $e = twd_compute_estimate($sel, $book);
    $got = ['oneOff' => $e['oneOff'], 'monthly' => $e['monthly'], 'low' => $e['low'], 'high' => $e['high'], 'deposit' => $e['deposit'], 'weeks' => $e['weeks'], 'lines' => array_map(fn($l) => [$l['label'], $l['amount']], $e['lines'])];
    if ($got !== $c['expect']) { $fail++; if ($fail <= 5) echo "MISMATCH #$i ", json_encode($sel), "\n  ts:  ", json_encode($c['expect']), "\n  php: ", json_encode($got), "\n"; }
}
echo $fail === 0 ? 'parity OK: ' . count($cases) . " cases identical\n" : "parity FAILED: $fail of " . count($cases) . "\n";
exit($fail === 0 ? 0 : 1);
