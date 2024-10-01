{
  description = "SRRC Water Data Map Applet";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            python3
            python3Packages.pip
            python3Packages.http-server
          ];

          shellHook = ''
            echo "Welcome to the SRRC Water Data Map Applet development environment!"
            echo "To start the server, run: python -m http.server"
          '';
        };
      }
    );
}
