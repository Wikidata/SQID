{ gitignoresrc }: final: prev:

let
  gitignoreSource = (import gitignoresrc { inherit (final.pkgs) lib; }).gitignoreSource;
in
{
  sqid-helper = final.pkgs.callPackage ./sqid-helper {
    inherit gitignoreSource;
  };
}
