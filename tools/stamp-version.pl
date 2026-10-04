#!/usr/bin/perl
# Stamps the stylesheet and script links in every page with a version number, so
# browsers fetch the new files after an update instead of reusing a saved copy
# (GitHub Pages lets browsers keep files for 10 minutes).
#
# It runs by itself before every commit (see .git/hooks/pre-commit). To run it by hand:
#   perl tools/stamp-version.pl
use strict; use warnings;

my @t = gmtime;
my $v = sprintf('%04d%02d%02d%02d%02d', $t[5] + 1900, $t[4] + 1, $t[3], $t[2], $t[1]);

for my $file (glob('*.html')) {
  open(my $in, '<:raw', $file) or die "$file: $!";
  my $html = do { local $/; <$in> }; close $in;
  my $before = $html;
  $html =~ s/(href="styles\.css)(\?v=\d+)?"/$1?v=$v"/g;
  $html =~ s/(src="script\.js)(\?v=\d+)?"/$1?v=$v"/g;
  next if $html eq $before;
  open(my $out, '>:raw', $file) or die "$file: $!";
  print $out $html; close $out;
  print "stamped $file with v=$v\n";
}
