<?php
// The quote engine (docs/QUOTE-ENGINE.md §3): a line-for-line mirror of
// web/src/lib/quote/engine.ts. tests/parity.php proves both produce identical output.
declare(strict_types=1);

final class QuoteError extends RuntimeException {}

function twd_round_to(float $n, int $step): int
{
    // Round to 6 decimals first so float noise (6500 × 1.15 = 7474.999…) can't flip a step.
    return (int) (round(round($n, 6) / $step) * $step);
}

/**
 * @param array{service:string,tier:string,units:int|float,addons:array<string,int|float>,monthly:list<string>,priority:bool} $sel
 * @return array{lines:list<array{label:string,amount:int}>,monthlyLines:list<array{label:string,amount:int}>,oneOff:int,monthly:int,low:int,high:int,deposit:int,weeks:int,pricebookVersion:string}
 */
function twd_compute_estimate(array $sel, array $book): array
{
    $service = null;
    foreach ($book['services'] as $s) if ($s['id'] === $sel['service']) $service = $s;
    if ($service === null) throw new QuoteError('Unknown service');
    $tier = null;
    foreach ($service['tiers'] as $t) if ($t['id'] === $sel['tier']) $tier = $t;
    if ($tier === null) throw new QuoteError('Unknown tier');
    $r = $book['rules'];
    $unit = $service['unit'];

    $units = $unit ? (int) min(max((int) round((float) $sel['units']), $unit['min']), $unit['max']) : 1;
    $lines = [];
    $monthlyLines = [];
    $oneOff = 0;
    $weeks = (float) $tier['weeks'];

    if (isset($tier['base'])) {
        $lines[] = ['label' => $tier['name'], 'amount' => (int) $tier['base']];
        $oneOff += (int) $tier['base'];
    }
    $extraUnits = ($unit && isset($tier['includedUnits'])) ? max(0, $units - (int) $tier['includedUnits']) : 0;
    $extraCost = $extraUnits * (int) ($tier['perUnit'] ?? 0);
    if ($extraCost > 0 && $unit) {
        $lines[] = ['label' => $extraUnits . ' extra ' . ($extraUnits === 1 ? $unit['name'] : $unit['plural']), 'amount' => $extraCost];
        $oneOff += $extraCost;
    }
    $buildCost = (int) ($tier['base'] ?? 0) + $extraCost;

    foreach ($service['addons'] as $addon) {
        $qty = $sel['addons'][$addon['id']] ?? 0;
        if (!$qty || $qty <= 0) continue;
        if (isset($addon['priceRate'])) {
            $amount = (int) round($buildCost * $addon['priceRate']);
        } elseif (isset($addon['per'])) {
            $q = ($unit && $addon['per'] === $unit['name']) ? $units : max(1, (int) round((float) $qty));
            $amount = $q * (int) ($addon['price'] ?? 0);
        } else {
            $amount = (int) ($addon['price'] ?? 0);
        }
        $lines[] = ['label' => $addon['name'], 'amount' => $amount];
        $oneOff += $amount;
        $weeks += (float) $addon['weeks'];
    }

    $monthly = 0;
    if (isset($tier['monthlyBase'])) {
        $monthlyLines[] = ['label' => $tier['name'] . ' package', 'amount' => (int) $tier['monthlyBase']];
        $monthly += (int) $tier['monthlyBase'];
    }
    foreach ($service['monthly'] as $m) {
        if (!in_array($m['id'], $sel['monthly'], true)) continue;
        $monthlyLines[] = ['label' => $m['name'], 'amount' => (int) $m['price']];
        $monthly += (int) $m['price'];
    }

    if ($sel['priority'] && $oneOff > 0) {
        $before = $oneOff;
        $oneOff = (int) round($oneOff * $r['rush']['multiplier']);
        $lines[] = ['label' => 'Priority delivery', 'amount' => $oneOff - $before];
    }

    $low = twd_round_to($oneOff * $r['rangeLow'], (int) $r['roundTo']);
    $high = twd_round_to($oneOff * $r['rangeHigh'], (int) $r['roundTo']);
    $deposit = $oneOff > $r['depositThreshold'] ? twd_round_to($low * $r['depositRate'], (int) $r['roundTo']) : 0;
    $finalWeeks = max(1, (int) ceil($weeks * ($sel['priority'] ? 0.6 : 1)));

    return [
        'lines' => $lines, 'monthlyLines' => $monthlyLines,
        'oneOff' => $oneOff, 'monthly' => $monthly, 'low' => $low, 'high' => $high,
        'deposit' => $deposit, 'weeks' => $finalWeeks, 'pricebookVersion' => (string) $book['version'],
    ];
}

function twd_rand(int $n): string
{
    return 'R ' . number_format($n, 0, '.', ' ');
}
